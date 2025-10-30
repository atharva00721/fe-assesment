import type { QA } from "@/lib/questions/schema";

export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function extractNameFromQA(qa: QA): string | null {
  const headerMatch = qa.answer.match(/^#\s+([^\n]+)/);
  let name = headerMatch?.[1]?.trim();
  if (!name) {
    const qMatch = qa.question.match(/^(?:How|What|Who) is\s+(.+?)\?$/i);
    if (qMatch) name = qMatch[1]?.trim();
  }
  return name ?? null;
}

export function buildNameIndex(initialQuestions: QA[]): Map<string, QA> {
  const byName = new Map<string, QA>();
  for (const qa of initialQuestions) {
    const name = extractNameFromQA(qa);
    if (name) {
      const key = name.toLowerCase();
      if (!byName.has(key)) byName.set(key, qa);
    }
  }
  return byName;
}


