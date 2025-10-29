"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageAvatar } from "@/components/ai-elements/message";
import { ServerResponse } from "@/components/ai-elements/server-response";
import { cn } from "@/lib/utils";
import { MessageSquareIcon } from "lucide-react";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";

import type { Message } from "./types";

type ConversationSectionProps = {
  messages: Message[];
  isResponding?: boolean;
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

const ConversationSection = ({ messages, isResponding = false }: ConversationSectionProps) => {
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
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});

  const handleTogglePrompt = useCallback((id: string) => {
    setExpandedPrompts((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const handleToggleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTogglePrompt(id);
    }
  }, [handleTogglePrompt]);

  return (
    <Conversation className="relative mx-auto flex h-full w-full flex-col">
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
              const isExpanded = Boolean(expandedPrompts[user.id]);
              const isTruncated = user.content.length > MAX_HEADING_LENGTH;
              const headingText = isExpanded || !isTruncated
                ? user.content
                : truncateText(user.content, MAX_HEADING_LENGTH);

              return (
                <section key={user.id} className="relative flex flex-col">
                  <header
                    className={cn(
                      "z-20 -mx-4 border-b border-slate-200/70 bg-slate-50/90 px-4 py-5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/90",
                      isExpanded ? "relative" : "sticky top-0"
                    )}
                  >
                    <div className="mx-auto flex w-full max-w-4xl items-start justify-between gap-4">
                      <div className="flex-1 max-w-3xl">
                        <h2
                          className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-50 wrap-break-word"
                          title={!isExpanded && isTruncated ? user.content : undefined}
                        >
                          {headingText}
                        </h2>
                      </div>
                      {isTruncated && (
                        <button
                          type="button"
                          onClick={() => handleTogglePrompt(user.id)}
                          onKeyDown={(e) => handleToggleKeyDown(e, user.id)}
                          className="mt-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:ring-offset-2"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Collapse question text" : "Expand question text"}
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>
                  </header>

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
