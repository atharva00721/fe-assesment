"use client";

import {
    useCallback,
    useMemo,
    useState,
    useRef,
    useEffect,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { useDebounce } from "react-haiku";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ConversationSection from "./conversation-section";
import PromptSection from "./prompt-section";
import dynamic from "next/dynamic";
import { ActiveTurnProvider } from "./active-turn-context";
import type { Message } from "./types";
import type { QA } from "@/lib/questions/schema";
import { createId, buildNameIndex } from "./utils";
import { useGlobalShortcuts, useQAIndex, useSuggestions } from "./hooks";

const KeyboardShortcutsDialog = dynamic(() => import("./keyboard-shortcuts-dialog"), {
    loading: () => null,
});

export default function ChatClient({ initialQuestions }: { initialQuestions: QA[] }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isResponding, setIsResponding] = useState(false);
    const [panelInputValue, setPanelInputValue] = useState("");
    const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
    const [activeTurnId, setActiveTurnId] = useState<string | null>(null);
    const [activeTurnMessage, setActiveTurnMessage] = useState<Message | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Debug: Log active turn changes
    useEffect(() => {
        console.log("[ChatClient] Current active turn ID:", activeTurnId);
        console.log("[ChatClient] Current active turn message:", activeTurnMessage);
    }, [activeTurnId, activeTurnMessage]);

    const handleActiveTurnChange = useCallback((id: string | null, message: Message | null) => {
        setActiveTurnId(id);
        setActiveTurnMessage(message);
    }, []);

    // Debounce input for search
    const debouncedInputValue = useDebounce(panelInputValue, 300);

    // Index questions by a quick lookup or simple search
    const qaIndex = useQAIndex(initialQuestions);

    // Map Pokémon names to QA for freeform name queries
    const nameIndex = useMemo(() => buildNameIndex(initialQuestions), [initialQuestions]);

    // Suggestions to show on the empty state
    const suggestions = useSuggestions(initialQuestions);

    // TanStack Query for server-side search with caching
    const {
        data: searchResults = [],
        isFetching: isSearching,
        error: searchError,
    } = useQuery({
        queryKey: ['search', debouncedInputValue],
        queryFn: async ({ signal }) => {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(debouncedInputValue)}`,
                { signal }
            );
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            return data.results as string[];
        },
        enabled: true, // Always enabled, empty query returns defaults
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 60 * 60 * 1000, // 60 minutes
        placeholderData: keepPreviousData, // Keep previous data during fetch
    });

    // Show search results when user is typing (always, even after first message)
    const shouldShowSearchResults = panelInputValue.trim().length > 0;

    const sendMessage = useCallback((rawContent: string) => {
        const trimmed = rawContent.trim();
        if (!trimmed) return;

        const userMessage: Message = { id: createId(), role: "user", content: trimmed };

        // Look up a predefined answer if exact match; fallback to a generic response
        const matched = qaIndex.get(trimmed.toLowerCase());
        // Try to resolve Pokémon by name (freeform queries like "pikachu" or "show me charizard")
        let byNameAnswer: string | undefined;
        if (!matched) {
            const lower = trimmed.toLowerCase();
            const exact = nameIndex.get(lower);
            if (exact) {
                byNameAnswer = exact.answer;
            } else {
                // Partial match: find first name present as a word
                for (const [name, qa] of nameIndex) {
                    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const re = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, "i");
                    if (re.test(lower)) {
                        byNameAnswer = qa.answer;
                        break;
                    }
                }
            }
        }

        const assistantContent = matched?.answer
            ?? byNameAnswer
            ?? `# Response\n\n${trimmed}\n\n---\n\n- Length: **${trimmed.length}** characters`;

        setMessages((prev) => [...prev, userMessage]);
        setIsResponding(true);

        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: createId(), role: "assistant", content: assistantContent },
            ]);
            setIsResponding(false);
        }, 300);
    }, [qaIndex, nameIndex]);

    const handlePanelSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!panelInputValue.trim()) return;
        sendMessage(panelInputValue);
        setPanelInputValue("");
    }, [panelInputValue, sendMessage]);

    const handleSearchResultClick = useCallback((question: string) => {
        setPanelInputValue(question);
        setSelectedSearchIndex(-1);
        // Focus textarea after selecting a result
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
    }, []);

    const handlePanelKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
        // Handle keyboard navigation when search results are visible
        if (shouldShowSearchResults && searchResults.length > 0) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedSearchIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                return;
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : -1));
                return;
            }

            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (selectedSearchIndex >= 0 && selectedSearchIndex < searchResults.length) {
                    // Select the highlighted search result
                    handleSearchResultClick(searchResults[selectedSearchIndex]);
                    setSelectedSearchIndex(-1);
                } else if (panelInputValue.trim()) {
                    // Submit current input if no result is selected
                    sendMessage(panelInputValue);
                    setPanelInputValue("");
                    setSelectedSearchIndex(-1);
                }
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                setSelectedSearchIndex(-1);
                // Optionally clear input on Escape
                // setPanelInputValue("");
                return;
            }
        }

        // Default Enter key handling (submit message)
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!panelInputValue.trim()) return;
            sendMessage(panelInputValue);
            setPanelInputValue("");
            setSelectedSearchIndex(-1);
        }

        // Ctrl/Cmd + Enter as alternative submit shortcut
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            if (!panelInputValue.trim()) return;
            sendMessage(panelInputValue);
            setPanelInputValue("");
            setSelectedSearchIndex(-1);
        }
    }, [panelInputValue, sendMessage, shouldShowSearchResults, searchResults, selectedSearchIndex, handleSearchResultClick]);

    const handlePanelInputChange = useCallback((value: string) => {
        setPanelInputValue(value);
        // Reset selected index when input becomes empty
        if (value.trim().length === 0) {
            setSelectedSearchIndex(-1);
        }
    }, []);

    useGlobalShortcuts(shouldShowSearchResults, textareaRef, setPanelInputValue);

    return (
        <ActiveTurnProvider value={{ activeTurnId, activeTurnMessage, setActiveTurnId, setActiveTurnMessage }}>
            <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
                {/* <header className="z-10 border-b h-[60px] flex items-center justify-center border-slate-200/70 bg-white/80 backdrop-blur px-6 py-6 dark:border-slate-800/60 dark:bg-slate-950/70">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate max-w-[60vw]">
                                    {activeTurnMessage?.content ?? "Simple Chat"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <KeyboardShortcutsDialog />
                        </div>
                    </div>
                </header> */}

                <KeyboardShortcutsDialog />
                <main className="relative z-10 flex h-[calc(100vh)] flex-col items-center justify-center overflow-x-hidden">
                    <div className="flex h-full w-full items-center justify-center">
                        <ConversationSection
                            messages={messages}
                            isResponding={isResponding}
                            onActiveTurnChange={handleActiveTurnChange}
                        />
                    </div>
                    <PromptSection
                        value={panelInputValue}
                        isResponding={isResponding}
                        onSubmit={handlePanelSubmit}
                        onChange={handlePanelInputChange}
                        onKeyDown={handlePanelKeyDown}
                        placement={messages.length > 0 ? "docked" : "floating"}
                        searchResults={searchResults}
                        onSearchResultClick={handleSearchResultClick}
                        showSearchResults={shouldShowSearchResults}
                        hasMessages={messages.length > 0}
                        selectedSearchIndex={selectedSearchIndex}
                        onSelectedSearchIndexChange={setSelectedSearchIndex}
                        textareaRef={textareaRef}
                        isSearching={isSearching}
                        searchError={searchError}
                        suggestions={suggestions}
                        onSuggestionClick={handleSearchResultClick}
                    />
                </main>
            </div>
        </ActiveTurnProvider>
    );
}


