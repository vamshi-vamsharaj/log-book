import dns from "node:dns/promises";

import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/session";
import { handleRouteError } from "@/lib/errors";

const MAX_BYTES = 50_000;
const FETCH_TIMEOUT_MS = 5000;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [a, b] = parts;

  if (a === undefined || b === undefined) return true;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;

  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80")
  );
}

async function assertSafeUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported");
  }

  const records = await dns.lookup(url.hostname, { all: true });

  for (const record of records) {
    if (record.family === 4 && isPrivateIpv4(record.address)) {
      throw new Error("This host cannot be previewed");
    }
    if (record.family === 6 && isPrivateIpv6(record.address)) {
      throw new Error("This host cannot be previewed");
    }
  }
}

function extractMeta(html: string, name: string): string | null {
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  );
  if (propertyMatch && propertyMatch[1]) {
    return propertyMatch[1];
  }

  const nameMatch = html.match(
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  );
  return nameMatch && nameMatch[1] ? nameMatch[1] : null;
}

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();

    const rawUrl = request.nextUrl.searchParams.get("url");

    if (!rawUrl) {
      return NextResponse.json({ error: { message: "url is required" } }, { status: 400 });
    }

    let url: URL;

    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: { message: "Invalid URL" } }, { status: 400 });
    }

    await assertSafeUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let html = "";

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "LogBookLinkPreview/1.0" },
      });

      if (response.type === "opaqueredirect" || !response.body) {
        return NextResponse.json({ url: url.toString(), title: null, description: null, siteName: null });
      }

      const reader = response.body.getReader();
      let received = 0;

      while (received < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        html += Buffer.from(value).toString("utf-8");
        received += value.byteLength;
      }

      reader.cancel().catch(() => undefined);
    } finally {
      clearTimeout(timeout);
    }

    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    const preview = {
      url: url.toString(),
      title: extractMeta(html, "og:title") ?? (titleTagMatch && titleTagMatch[1] ? titleTagMatch[1].trim() : null),
      description: extractMeta(html, "og:description") ?? extractMeta(html, "description"),
      siteName: extractMeta(html, "og:site_name") ?? url.hostname,
    };

    return NextResponse.json(preview);
  } catch (error) {
    return handleRouteError(error);
  }
}