"use client";

import { useMemo } from "react";

import { Textarea } from "@/components/ui/textarea";
import { LinkPreviewCard } from "@/features/tasks/components/link-preview-card";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function DescriptionEditor({ value, onChange, onBlur }: DescriptionEditorProps) {
  const urls = useMemo(() => {
    const matches = value.match(URL_REGEX) ?? [];
    return Array.from(new Set(matches));
  }, [value]);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        rows={5}
        placeholder="Add context, notes, or links..."
      />
      {urls.length > 0 ? (
        <div className="space-y-1.5">
          {urls.map((url) => (
            <LinkPreviewCard key={url} url={url} />
          ))}
        </div>
      ) : null}
    </div>
  );
}