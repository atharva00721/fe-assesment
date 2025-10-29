"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import { Shimmer } from "@/components/ai-elements/shimmer";

type SearchResult = {
  question: string;
};

type SearchResultsProps = {
  results: SearchResult[];
  isVisible: boolean;
  onResultClick: (question: string) => void;
  placement?: "top" | "bottom";
  query?: string;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  isSearching?: boolean;
  searchError?: Error | null;
};

// Function to highlight matching text in search results
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || !query.trim()) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Find all matching ranges (start and end positions)
  const matchRanges: Array<{ start: number; end: number }> = [];
  let startIndex = 0;

  while (startIndex < lowerText.length) {
    const index = lowerText.indexOf(lowerQuery, startIndex);
    if (index === -1) break;

    matchRanges.push({ start: index, end: index + lowerQuery.length });
    startIndex = index + 1;
  }

  if (matchRanges.length === 0) {
    return text;
  }

  // Build array of text segments with highlights
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  matchRanges.forEach((range, rangeIdx) => {
    // Add non-highlighted text before this match
    if (range.start > lastIndex) {
      segments.push(text.slice(lastIndex, range.start));
    }

    // Add highlighted text
    segments.push(
      <span key={`highlight-${rangeIdx}`} className="bg-yellow-200 dark:bg-yellow-600/50 font-semibold text-slate-900 dark:text-slate-50">
        {text.slice(range.start, range.end)}
      </span>
    );

    lastIndex = range.end;
  });

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments;
};

const SearchResults = ({
  results,
  isVisible,
  onResultClick,
  placement = "bottom",
  query = "",
  selectedIndex = -1,
  onSelectedIndexChange,
  isSearching = false,
  searchError = null,
}: SearchResultsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll selected item into view when it changes
  useEffect(() => {
    if (selectedIndex >= 0 && selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Reset selected index when results change (but only if index is out of bounds)
  useEffect(() => {
    if (onSelectedIndexChange && selectedIndex >= results.length) {
      onSelectedIndexChange(-1);
    }
  }, [results.length, selectedIndex, onSelectedIndexChange]);

  if (!isVisible) {
    return null;
  }

  const isTop = placement === "top";
  const selectedId = selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined;

  const handleMouseEnter = (index: number) => {
    if (onSelectedIndexChange) {
      onSelectedIndexChange(index);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: isTop ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isTop ? 10 : -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "absolute left-0 right-0 z-50",
          isTop ? "bottom-full mb-2" : "top-full mt-2"
        )}
        ref={containerRef}
        role="listbox"
        aria-label="Search results"
        aria-activedescendant={selectedId}
      >
        <div className="rounded-xl border border-slate-200/70 bg-white/95 backdrop-blur-sm shadow-lg dark:border-slate-800/60 dark:bg-slate-900/95">
          <div className="p-2">
            <div className="mb-1 px-3 py-2">
              {isSearching ? (
                <Shimmer className="text-xs font-medium uppercase tracking-wider">
                  Searching...
                </Shimmer>
              ) : (
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Search Results
                </p>
              )}
            </div>
            {searchError ? (
              <div className="px-3 py-3 text-sm text-red-600 dark:text-red-400">
                Failed to load search results. Please try again.
              </div>
            ) : isSearching && results.length === 0 ? (
              <div className="px-3 py-3">
                <div className="space-y-2">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Shimmer className="text-sm" duration={1.5 + idx * 0.2}>
                        Searching for results...
                      </Shimmer>
                    </div>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                No results found
              </div>
            ) : (
              <div className="space-y-1" role="group">
                {results.map((result, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={idx}
                      id={`search-result-${idx}`}
                      ref={isSelected ? selectedButtonRef : null}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => onResultClick(result.question)}
                      onMouseEnter={() => handleMouseEnter(idx)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-slate-800",
                        "focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600",
                        isSelected && "bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-400 dark:ring-slate-600"
                      )}
                    >
                      <p className="text-slate-900 dark:text-slate-50 line-clamp-2">
                        {highlightText(result.question, query)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchResults;

