"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const defaultComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
};

type MarkdownContentProps = {
  content: string;
  className?: string;
  components?: Components;
};

export function MarkdownContent({ content, className = "", components }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={{ ...defaultComponents, ...components }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
