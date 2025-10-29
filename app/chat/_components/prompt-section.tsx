"use client";

import {
    type FormEvent,
    type KeyboardEvent,
    type RefObject,
} from "react";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUpIcon } from "lucide-react";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import SearchResults from "./search-results";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";

type PromptSectionProps = {
    value: string;
    isResponding: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onChange: (value: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    placement?: "docked" | "floating";
    searchResults?: string[];
    onSearchResultClick?: (question: string) => void;
    showSearchResults?: boolean;
    hasMessages?: boolean;
    selectedSearchIndex?: number;
    onSelectedSearchIndexChange?: (index: number) => void;
    textareaRef?: RefObject<HTMLTextAreaElement | null>;
    isSearching?: boolean;
    searchError?: Error | null;
    suggestions?: string[];
    onSuggestionClick?: (question: string) => void;
};

const PromptSection = ({
    value,
    isResponding,
    onSubmit,
    onChange,
    onKeyDown,
    placeholder = "Ask, Search or Chat...",
    placement = "docked",
    searchResults = [],
    onSearchResultClick,
    showSearchResults = false,
    hasMessages = false,
    selectedSearchIndex = -1,
    onSelectedSearchIndexChange,
    textareaRef,
    isSearching = false,
    searchError = null,
    suggestions = [],
    onSuggestionClick,
}: PromptSectionProps) => {
    const isDocked = placement === "docked";
    // When docked (has messages), show results on top; when floating (no messages), show below
    const searchResultsPlacement = hasMessages ? "top" : "bottom";

    return (
        <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={cn(
                "w-full max-w-3xl transform z-30",
                isDocked
                    ? "absolute bottom-10 left-1/2 -translate-x-1/2"
                    : "absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 sm:top-[53%] md:top-[51%]"
            )}
        >
            <form onSubmit={onSubmit} className="relative">
                {!hasMessages && suggestions.length > 0 && (
                    <div className="mb-3">
                        <Suggestions>
                            {suggestions.map((q) => (
                                <Suggestion key={q} suggestion={q} onClick={(s) => onSuggestionClick?.(s)} />
                            ))}
                        </Suggestions>
                    </div>
                )}
                <InputGroup className="bg-background">
                    <InputGroupTextarea
                        ref={textareaRef}
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={isResponding}
                        className="min-h-[60px] resize-none bg-transparent text-base leading-6 focus-visible:ring-0 dark:bg-transparent"
                        aria-label="Chat input"
                        aria-describedby="search-results-description"
                    />
                    <InputGroupAddon align="block-end" className="gap-2">
                        <InputGroupText className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                            {isResponding ? "Responding..." : "Ready"}
                        </InputGroupText>
                        <Separator orientation="vertical" className="h-4" />
                        <InputGroupButton
                            variant="default"
                            className="rounded-full"
                            size="icon-xs"
                            type="submit"
                            disabled={!value.trim() || isResponding}
                        >
                            <ArrowUpIcon className="size-3.5" />
                            <span className="sr-only">Send</span>
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                <div id="search-results-description" className="sr-only">
                    {showSearchResults && searchResults.length > 0
                        ? `${searchResults.length} search results available. Use arrow keys to navigate, Enter to select, Escape to close.`
                        : ""}
                </div>
                <SearchResults
                    results={searchResults.map(q => ({ question: q }))}
                    isVisible={showSearchResults}
                    onResultClick={onSearchResultClick || (() => { })}
                    placement={searchResultsPlacement}
                    query={value}
                    selectedIndex={selectedSearchIndex}
                    onSelectedIndexChange={onSelectedSearchIndexChange}
                    isSearching={isSearching}
                    searchError={searchError}
                />
            </form>
        </motion.div>
    );
};

export default PromptSection;


