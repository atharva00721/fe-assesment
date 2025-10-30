"use client";

import { useEffect, useMemo } from "react";
import type { QA } from "@/lib/questions/schema";

export function useSuggestions(initialQuestions: QA[]) {
  return useMemo(() => initialQuestions.slice(0, 8).map((q) => q.question), [initialQuestions]);
}

export function useQAIndex(initialQuestions: QA[]) {
  return useMemo(() => {
    const byText = new Map<string, QA>();
    for (const qa of initialQuestions) byText.set(qa.question.toLowerCase(), qa);
    return byText;
  }, [initialQuestions]);
}

export function useGlobalShortcuts(
  shouldShowSearchResults: boolean,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  setPanelInputValue: (v: string) => void
) {
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        textareaRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        const activeElement = document.activeElement;
        if (activeElement === textareaRef.current && !shouldShowSearchResults && textareaRef.current) {
          setPanelInputValue("");
          textareaRef.current.blur();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [shouldShowSearchResults, textareaRef, setPanelInputValue]);
}
