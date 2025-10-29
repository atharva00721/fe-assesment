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
import KeyboardShortcutsDialog from "./keyboard-shortcuts-dialog";
import type { ConversationMode, Message } from "./types";
import type { QA } from "@/lib/questions";

const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

export default function ChatClient({ initialQuestions }: { initialQuestions: QA[] }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [mode, setMode] = useState<ConversationMode>("Auto");
    const [isResponding, setIsResponding] = useState(false);
    const [panelInputValue, setPanelInputValue] = useState("");
    const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Debounce input for search
    const debouncedInputValue = useDebounce(panelInputValue, 300);

    // Index questions by a quick lookup or simple search
    const qaIndex = useMemo(() => {
        const byText = new Map<string, QA>();
        for (const qa of initialQuestions) byText.set(qa.question.toLowerCase(), qa);
        return byText;
    }, [initialQuestions]);

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
        const assistantContent = matched
            ? matched.answer
            : `# ${mode} reply\n\n${trimmed}\n\n---\n\n- Mode: **${mode}**\n- Length: **${trimmed.length}** characters`;

        setMessages((prev) => [...prev, userMessage]);
        setIsResponding(true);

        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: createId(), role: "assistant", content: assistantContent },
            ]);
            setIsResponding(false);
        }, 300);
    }, [mode, qaIndex]);

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

    const handleModeSelect = useCallback((nextMode: ConversationMode) => {
        setMode(nextMode);
    }, []);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
            // Ctrl/Cmd + K to focus input
            if ((event.ctrlKey || event.metaKey) && event.key === "k") {
                event.preventDefault();
                textareaRef.current?.focus();
                return;
            }

            // Escape to clear input when focused and no search results
            if (event.key === "Escape") {
                const activeElement = document.activeElement;
                if (activeElement === textareaRef.current && !shouldShowSearchResults && textareaRef.current) {
                    setPanelInputValue("");
                    textareaRef.current.blur();
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [shouldShowSearchResults]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
            <header className="z-10 border-b h-[60px] flex items-center justify-center border-slate-200/70 bg-white/80 backdrop-blur px-6 py-6 dark:border-slate-800/60 dark:bg-slate-950/70">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                                Simple Chat
                            </p>
                        </div>
                    </div>
                    <KeyboardShortcutsDialog />
                </div>
            </header>

            <main className="relative z-10 flex h-[calc(100vh-60px)] flex-col items-center justify-center">
                <div className="flex h-full w-full items-center justify-center">
                    <ConversationSection messages={messages} isResponding={isResponding} />
                </div>
                <PromptSection
                    mode={mode}
                    value={panelInputValue}
                    isResponding={isResponding}
                    onSubmit={handlePanelSubmit}
                    onChange={handlePanelInputChange}
                    onKeyDown={handlePanelKeyDown}
                    onModeSelect={handleModeSelect}
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
                />
            </main>
        </div>
    );
}


