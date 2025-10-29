import type { Comment, UserVote } from "./types";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

/**
 * Generate a stable key from message content.
 * Extracts Pokemon name from questions like "Who is Ivysaur?" -> "Ivysaur"
 * Falls back to normalized content if no Pokemon name found.
 */
export function getStableMessageKey(messageContent: string | null): string {
  if (!messageContent) return "default";
  
  // Extract Pokemon name from questions like "Who is X?" or "What is X?"
  const pokemonMatch = messageContent.match(/(?:Who|What) is\s+(.+?)\?/i);
  if (pokemonMatch && pokemonMatch[1]) {
    return pokemonMatch[1].trim();
  }
  
  // Fallback: normalize the content (lowercase, trim, replace spaces with hyphens)
  return messageContent
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50); // Limit length
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  return safeParse<T>(window.localStorage.getItem(key), fallback);
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return; // no-op on server
  window.localStorage.setItem(key, JSON.stringify(value));
}

const commentsKey = (key: string) => `comments:${key}`;
const votesKey = (key: string) => `userVotes:${key}`;

/**
 * Get comments for a message using a stable key.
 * @param stableKey - Stable key generated from message content (e.g., Pokemon name)
 */
export function getCommentsForMessage(stableKey: string): Comment[] {
  return read<Comment[]>(commentsKey(stableKey), []);
}

/**
 * Save comments for a message using a stable key.
 * @param stableKey - Stable key generated from message content (e.g., Pokemon name)
 * @param comments - Array of comments to save
 */
export function saveCommentsForMessage(
  stableKey: string,
  comments: Comment[]
): void {
  write<Comment[]>(commentsKey(stableKey), comments);
}

/**
 * Get user votes for a message using a stable key.
 * @param stableKey - Stable key generated from message content (e.g., Pokemon name)
 */
export function getUserVotes(stableKey: string): Record<string, UserVote> {
  return read<Record<string, UserVote>>(votesKey(stableKey), {});
}

/**
 * Save user votes for a message using a stable key.
 * @param stableKey - Stable key generated from message content (e.g., Pokemon name)
 * @param votes - Record of commentId -> vote mapping
 */
export function saveUserVotes(
  stableKey: string,
  votes: Record<string, UserVote>
): void {
  write<Record<string, UserVote>>(votesKey(stableKey), votes);
}

