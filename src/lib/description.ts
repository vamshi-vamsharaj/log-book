/**
 * A minimal, allow-listed rich-text document shape (Tiptap/ProseMirror JSON),
 * re-validated and re-serialized on every write so nothing except the exact
 * node/mark types below can ever reach the database — this is what makes the
 * "rich descriptions" feature safe to store and safe to render.
 */
const ALLOWED_NODE_TYPES = new Set(["doc", "paragraph", "text", "bulletList", "orderedList", "listItem", "hardBreak"]);
const ALLOWED_MARK_TYPES = new Set(["bold", "italic", "strike", "code", "link"]);

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
  content?: RichTextNode[];
}

export interface RichTextDoc {
  type: "doc";
  content: RichTextNode[];
}

const URL_PATTERN = /^https?:\/\//i;

function sanitizeMark(mark: { type: string; attrs?: Record<string, unknown> }) {
  if (!ALLOWED_MARK_TYPES.has(mark.type)) {
    return null;
  }
  if (mark.type === "link") {
    const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
    if (!URL_PATTERN.test(href)) {
      return null;
    }
    return { type: "link", attrs: { href, target: "_blank", rel: "noopener noreferrer nofollow" } };
  }
  return { type: mark.type };
}

function sanitizeNode(node: RichTextNode, depth: number): RichTextNode | null {
  if (depth > 20 || !ALLOWED_NODE_TYPES.has(node.type)) {
    return null;
  }

  const result: RichTextNode = { type: node.type };

  if (node.type === "text") {
    if (typeof node.text !== "string" || node.text.length === 0) {
      return null;
    }
    result.text = node.text.slice(0, 5000);
    if (Array.isArray(node.marks)) {
      const marks = node.marks.map(sanitizeMark).filter((m): m is NonNullable<typeof m> => m !== null);
      if (marks.length > 0) {
        result.marks = marks;
      }
    }
    return result;
  }

  if (Array.isArray(node.content)) {
    const content = node.content
      .map((child) => sanitizeNode(child, depth + 1))
      .filter((child): child is RichTextNode => child !== null);
    result.content = content;
  } else {
    result.content = [];
  }

  return result;
}

const MAX_TOTAL_NODES = 2000;

function countNodes(node: RichTextNode): number {
  return 1 + (node.content ?? []).reduce((sum, child) => sum + countNodes(child), 0);
}

/** Returns a fully sanitized doc, or null if the input is empty/invalid — never throws on bad input. */
export function sanitizeDescription(input: unknown): RichTextDoc | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as { type?: unknown; content?: unknown };

  if (candidate.type !== "doc" || !Array.isArray(candidate.content)) {
    return null;
  }

  const content = candidate.content
    .map((child) => sanitizeNode(child as RichTextNode, 1))
    .filter((child): child is RichTextNode => child !== null);

  const doc: RichTextDoc = { type: "doc", content };

  if (countNodes(doc) > MAX_TOTAL_NODES) {
    return { type: "doc", content: content.slice(0, 200) };
  }

  const hasAnyText = content.some((node) => nodeHasText(node));
  return hasAnyText ? doc : null;
}

function nodeHasText(node: RichTextNode): boolean {
  if (node.type === "text") {
    return Boolean(node.text && node.text.trim().length > 0);
  }
  return (node.content ?? []).some(nodeHasText);
}

/** Extracts every http(s) URL that appears as a `link` mark, de-duplicated, for link-preview rendering. */
export function extractLinkUrls(doc: RichTextDoc | null): string[] {
  if (!doc) return [];
  const urls = new Set<string>();

  function walk(node: RichTextNode) {
    for (const mark of node.marks ?? []) {
      if (mark.type === "link" && typeof mark.attrs?.href === "string") {
        urls.add(mark.attrs.href);
      }
    }
    for (const child of node.content ?? []) {
      walk(child);
    }
  }

  for (const child of doc.content) {
    walk(child);
  }

  return Array.from(urls).slice(0, 10);
}
