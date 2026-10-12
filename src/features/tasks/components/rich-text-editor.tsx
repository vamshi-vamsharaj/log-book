"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Strikethrough } from "lucide-react";
import { useEffect } from "react";

import { extractLinkUrls, sanitizeDescription, type RichTextDoc } from "@/lib/description";
import { cn } from "@/lib/utils";
import { LinkPreviewCard } from "@/features/link-preview/components/link-preview-card";

interface RichTextEditorProps {
  value: RichTextDoc | null;
  onChange: (value: RichTextDoc | null) => void;
  placeholder?: string;
  className?: string;
}

const EMPTY_DOC: RichTextDoc = { type: "doc", content: [{ type: "paragraph", content: [] }] };

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        active ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * A lightweight Notion-style rich-text field for task descriptions:
 * bold/italic/strike, bullet & ordered lists, and links (with live preview
 * cards rendered underneath, fed by the server-side SSRF-guarded fetcher).
 * Every change is re-sanitized client-side before it's handed to onChange,
 * and re-sanitized again server-side on write — belt and suspenders.
 */
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
    ],
    content: value ?? EMPTY_DOC,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[4.5rem] leading-relaxed dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(sanitizeDescription(instance.getJSON()));
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value ?? EMPTY_DOC);
    if (current !== next) {
      editor.commands.setContent(value ?? EMPTY_DOC, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return <div className={cn("min-h-[6rem] animate-pulse rounded-lg bg-muted", className)} />;
  }

  const links = extractLinkUrls(value);
  const isEmpty = editor.isEmpty;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background/40 transition-colors focus-within:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border/60 px-2 py-1.5">
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Paste a URL");
            if (!url) return;
            if (!/^https?:\/\//i.test(url)) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div className="relative px-3 py-2.5">
        {isEmpty && placeholder ? (
          <p className="pointer-events-none absolute left-3 top-2.5 text-sm text-muted-foreground/60">
            {placeholder}
          </p>
        ) : null}
        <EditorContent editor={editor} />
      </div>
      {links.length > 0 ? (
        <div className="space-y-1.5 border-t border-border/60 px-3 py-2.5">
          {links.map((url) => (
            <LinkPreviewCard key={url} url={url} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
