import ReactMarkdown from "react-markdown";
import { markdownPlugins, markdownClassName } from "./markdown-config";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

type ServerResponseProps = {
  content: string;
  className?: string;
};

/**
 * Server Component for rendering markdown content
 * Renders markdown on the server for SEO and performance benefits
 * No "use client" directive - this is a Server Component
 */
export function ServerResponse({ content, className }: ServerResponseProps) {
  const components: Components = {
    // Fix HTML nesting: use div instead of p for paragraphs that might contain images
    p: ({ children, ...props }) => (
      <div className="mb-4" {...props}>
        {children}
      </div>
    ),
    // Style headings
    h1: ({ children, ...props }) => (
      <h1 className="mb-4 mt-6 text-2xl font-bold" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="mb-3 mt-5 text-xl font-semibold" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="mb-2 mt-4 text-lg font-semibold" {...props}>
        {children}
      </h3>
    ),
    // Style lists
    ul: ({ children, ...props }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),
    // Style tables
    table: ({ children, ...props }) => (
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),
    // Style images
    img: ({ ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="mb-4 mt-4 max-w-full rounded-md" {...props} alt={props.alt || ""} />
    ),
    // Style blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote className="mb-4 border-l-4 border-muted-foreground/20 pl-4 italic" {...props}>
        {children}
      </blockquote>
    ),
    // Style code blocks
    pre: ({ children, ...props }) => (
      <pre className="mb-4 overflow-x-auto rounded-md bg-muted p-4 text-sm" {...props}>
        {children}
      </pre>
    ),
    code: ({ children, ...props }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
        {children}
      </code>
    ),
    // Style links
    a: ({ children, ...props }) => (
      <a className="text-primary underline hover:no-underline" {...props}>
        {children}
      </a>
    ),
    // Style emphasis
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-bold" {...props}>
        {children}
      </strong>
    ),
    // Style horizontal rules
    hr: ({ ...props }) => (
      <hr className="my-6 border-border" {...props} />
    ),
  };

  return (
    <div className={cn(markdownClassName, className)}>
      <ReactMarkdown
        remarkPlugins={[...markdownPlugins.remark]}
        rehypePlugins={[...markdownPlugins.rehype]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

