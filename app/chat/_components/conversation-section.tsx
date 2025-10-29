"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageAvatar } from "@/components/ai-elements/message";
import { ServerResponse } from "@/components/ai-elements/server-response";
import { MessageSquareIcon } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";

import type { Message } from "./types";
import CommentsPanel from "./comments-panel";

type ConversationSectionProps = {
  messages: Message[];
  isResponding?: boolean;
  onActiveTurnChange?: (id: string | null, message: Message | null) => void;
};

const displayNames: Record<Message["role"], string> = {
  user: "You",
  assistant: "Assistant",
};

const avatars: Record<Message["role"], string> = {
  user: "https://github.com/haydenbleasel.png",
  assistant: "https://github.com/openai.png",
};

type ConversationTurn = {
  user: Message;
  assistants: Message[];
};

const truncateText = (value: string, maxLength = 140) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
};

const MAX_HEADING_LENGTH = 160;

const ConversationSection = ({ messages, isResponding = false, onActiveTurnChange }: ConversationSectionProps) => {
  const turns = useMemo<ConversationTurn[]>(() => {
    const result: ConversationTurn[] = [];
    let currentTurn: ConversationTurn | undefined;

    messages.forEach((message) => {
      if (message.role === "user") {
        currentTurn = { user: message, assistants: [] };
        result.push(currentTurn);
      } else if (currentTurn) {
        currentTurn.assistants.push(message);
      }
    });

    return result;
  }, [messages]);

  const hasTurns = turns.length > 0;
  const pendingTurnId = isResponding && turns.length > 0 ? turns[turns.length - 1]?.user.id : undefined;

  // Floating header state and IntersectionObserver
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);

  // IntersectionObserver to track which section is most visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the section whose top is closest to the viewport top within the band
        const candidates = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({
            id: e.target.getAttribute("data-turn-id") || "",
            top: e.boundingClientRect.top,
            ratio: e.intersectionRatio,
          }))
          .filter((c) => c.id);

        if (candidates.length === 0) return;

        // Pick the one closest to the top (>= 0) otherwise the highest one
        let best = candidates
          .filter((c) => c.top >= 0)
          .sort((a, b) => Math.abs(a.top) - Math.abs(b.top))[0];

        if (!best) {
          best = candidates.sort((a, b) => b.top - a.top)[0];
        }

        if (best) {
          setActiveTurnId(best.id);
        }
      },
      {
        root: null,
        // Create a focus band so the header switches when a section enters the upper half
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all section elements
    const nodes = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[];
    nodes.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [turns]);

  // Find the active turn for display
  const activeTurn = useMemo(() => {
    if (!activeTurnId) return null;
    return turns.find((t) => t.user.id === activeTurnId) || null;
  }, [activeTurnId, turns]);

  // Notify parent when active turn changes
  useEffect(() => {
    console.log("[ConversationSection] Active turn changed:", activeTurnId);
    const activeTurnMessage = activeTurn?.user || null;
    onActiveTurnChange?.(activeTurnId ?? null, activeTurnMessage);
  }, [activeTurnId, activeTurn, onActiveTurnChange]);

  return (
    <Conversation className="relative mx-auto flex h-full w-full flex-col">
      {/* Global floating header */}
      {hasTurns && (
        <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200/70 bg-slate-50/90 px-4 py-5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/90">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
            <div className="flex-1 min-w-0 max-w-3xl">
              <h2
                className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-50 wrap-break-word"
                aria-live="polite"
              >
                {activeTurn ? truncateText(activeTurn.user.content, MAX_HEADING_LENGTH) : "Latest question"}
              </h2>
            </div>
            <div className="shrink-0">
              <CommentsPanel />
            </div>
          </div>
        </div>
      )}

      <ConversationContent className="flex h-full max-w-4xl mx-auto w-full flex-col">
        {!hasTurns && !isResponding ? (
          <ConversationEmptyState
            description="Messages will appear here as the conversation progresses."
            icon={<MessageSquareIcon className="size-6" />}
            title="Start a conversation"
          />
        ) : (
          <div className="flex flex-col pb-46">
            {turns.map(({ user, assistants }) => {
              return (
                <section
                  key={user.id}
                  data-turn-id={user.id}
                  ref={(el) => {
                    sectionRefs.current[user.id] = el;
                  }}
                  className="relative flex flex-col"
                >
                  <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
                    {assistants.map((assistant) => (
                      <div className="flex w-full justify-start" key={assistant.id}>
                        <div className="flex w-full max-w-4xl items-start gap-3">
                          <ServerResponse
                            content={assistant.content}
                            className="prose prose-sm dark:prose-invert"
                          />
                        </div>
                      </div>
                    ))}

                    {pendingTurnId === user.id && (
                      <div className="flex w-full justify-start" key={`${user.id}-pending`}>
                        <div className="flex w-full max-w-4xl items-center gap-3 text-slate-500 dark:text-slate-400">
                          <MessageAvatar
                            name={displayNames.assistant}
                            src={avatars.assistant}
                          />
                          <div className="flex items-center gap-2">
                            <span className="size-1.5 animate-pulse rounded-full bg-current" />
                            Thinking
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
};

export default ConversationSection;
