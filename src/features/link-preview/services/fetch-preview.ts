import "server-only";

import dns from "node:dns/promises";
import net from "node:net";

const FETCH_TIMEOUT_MS = 4000;
const MAX_RESPONSE_BYTES = 512 * 1024; // 512KB cap while streaming the body
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  image: string | null;
}

export class LinkPreviewBlockedError extends Error {}

/** True if `ip` is a private, loopback, link-local, CGNAT, multicast, or
 * unspecified address — the SSRF deny-list. Covers both IPv4 and IPv6. */
export function isPrivateOrReservedIp(ip: string): boolean {
  const family = net.isIP(ip);

  if (family === 4) {
    const octets = ip.split(".").map(Number);
    const a = octets[0] ?? NaN;
    const b = octets[1] ?? NaN;
    if (Number.isNaN(a) || Number.isNaN(b)) return true; // fail closed on malformed input
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 192 && b === 0) return true; // 192.0.0.0/24 IETF protocol assignments
    if (a >= 224) return true; // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
    return false;
  }

  if (family === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80:") || lower.startsWith("fe8") || lower.startsWith("fe9")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 unique local
    if (lower.startsWith("::ffff:")) {
      // IPv4-mapped IPv6 — unwrap and re-check the embedded IPv4 address.
      const mapped = lower.replace("::ffff:", "");
      if (net.isIP(mapped) === 4) return isPrivateOrReservedIp(mapped);
    }
    return false;
  }

  return true; // not a parseable IP at all: fail closed
}

async function assertPublicHost(hostname: string): Promise<void> {
  const literalFamily = net.isIP(hostname);

  if (literalFamily) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new LinkPreviewBlockedError("Refusing to fetch a private/reserved IP literal");
    }
    return;
  }

  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".internal")) {
    throw new LinkPreviewBlockedError("Refusing to fetch a local/internal hostname");
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });

  if (records.length === 0) {
    throw new LinkPreviewBlockedError("Hostname did not resolve");
  }

  for (const record of records) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new LinkPreviewBlockedError(`Hostname resolves to a private/reserved address (${record.address})`);
    }
  }
}

function extractMeta(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${key}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1] !== undefined) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function readBodyCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        chunks.push(value);
        if (received >= maxBytes) break;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
}

/**
 * Fetches OpenGraph/meta preview data for `rawUrl`, guarded against SSRF via
 * protocol allow-list + DNS-resolved private-IP deny-list re-checked on every
 * redirect hop, a request timeout, and a capped response-size read. Returns
 * `null` (never throws to the caller) when the preview genuinely cannot be
 * produced, so the UI can gracefully fall back to a plain link.
 */
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview | null> {
  let current: URL;

  try {
    current = new URL(rawUrl);
  } catch {
    return null;
  }

  const MAX_REDIRECTS = 3;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!ALLOWED_PROTOCOLS.has(current.protocol)) {
      return null;
    }

    try {
      await assertPublicHost(current.hostname);
    } catch {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(current.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "LogBookLinkPreview/1.0 (+link unfurling)" },
      });
    } catch {
      clearTimeout(timeout);
      return null;
    }

    clearTimeout(timeout);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;
      try {
        current = new URL(location, current);
      } catch {
        return null;
      }
      continue; // re-validate the new host on the next loop iteration
    }

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return null;
    }

    const html = await readBodyCapped(response, MAX_RESPONSE_BYTES);
    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    return {
      url: current.toString(),
      title: extractMeta(html, "og:title") ?? (titleTagMatch?.[1] ? decodeHtmlEntities(titleTagMatch[1].trim()) : null),
      description: extractMeta(html, "og:description") ?? extractMeta(html, "description"),
      siteName: extractMeta(html, "og:site_name"),
      image: extractMeta(html, "og:image"),
    };
  }

  return null; // too many redirects
}
