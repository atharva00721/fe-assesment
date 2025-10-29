import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

/**
 * Shared markdown configuration for both server and client components
 * Following SRP - single source of truth for markdown plugins
 */
export const markdownPlugins = {
  remark: [remarkGfm, remarkMath],
  rehype: [rehypeKatex, rehypeRaw],
} as const;

/**
 * Shared prose styling for markdown content
 * Ensures consistent formatting across all markdown renders
 * Matches the original Response component styling
 */
export const markdownClassName = "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0";

