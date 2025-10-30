"use client";

import { useActiveTurn } from "./active-turn-context";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/comments/comment-list";
import { CommentInput } from "@/components/comments/comment-input";
import { getStableMessageKey, getCommentsForMessage, saveCommentsForMessage } from "@/components/comments/comment-storage";
import type { Comment } from "@/components/comments/types";

// Extract Pokémon name from question text (e.g., "Who is Blastoise?" -> "Blastoise")
function extractPokemonName(question: string | null): string {
  if (!question) return "Pokémon";
  const match = question.match(/(?:Who|What) is\s+(.+?)\?/i);
  return match ? match[1] : "Pokémon";
}

function toTitleCase(name: string): string {
  return name
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CommentsPanel() {
  const { activeTurnId, activeTurnMessage } = useActiveTurn();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  // Extract Pokémon name from question text
  const pokemonName = useMemo(() => {
    if (!activeTurnMessage?.content) return "Pokémon";
    return toTitleCase(extractPokemonName(activeTurnMessage.content));
  }, [activeTurnMessage]);

  // Generate stable key from message content (so same question = same comments)
  const stableKey = useMemo(() => {
    if (!activeTurnMessage?.content) return null;
    return getStableMessageKey(activeTurnMessage.content);
  }, [activeTurnMessage]);

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: async (data: { content: string; author: string }) => {
      if (!stableKey) return [];
      const currentComments = getCommentsForMessage(stableKey);
      const newComment: Comment = {
        id: crypto.randomUUID(),
        content: data.content,
        author: data.author,
        timestamp: Date.now(),
        parentId: null,
        upvotes: 0,
        downvotes: 0,
      };
      const updatedComments = [...currentComments, newComment];
      const ok = saveCommentsForMessage(stableKey, updatedComments);
      if (!ok) throw new Error("quota");
      return updatedComments;
    },
    onMutate: async (newData: { content: string; author: string }) => {
      if (!stableKey) return { previous: [] };
      await queryClient.cancelQueries({ queryKey: ["comments", stableKey] });

      const previous = queryClient.getQueryData<Comment[]>([
        "comments",
        stableKey,
      ]);

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content: newData.content,
        author: newData.author,
        timestamp: Date.now(),
        parentId: null,
        upvotes: 0,
        downvotes: 0,
      };
      const optimisticComments = [...(previous || []), optimisticComment];
      queryClient.setQueryData<Comment[]>(["comments", stableKey], optimisticComments);

      return { previous };
    },
    onError: (err: unknown, newData: { content: string; author: string }, context: { previous?: Comment[] } | undefined) => {
      if (context?.previous && stableKey) {
        queryClient.setQueryData(["comments", stableKey], context.previous);
      }
      toast.error("Couldn't post comment. Restored previous state.");
    },
    onSuccess: () => {
      if (stableKey) {
        queryClient.invalidateQueries({ queryKey: ["comments", stableKey] });
        toast.success("Comment posted.");
      }
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
  });

  if (!activeTurnId || !stableKey) return null;

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/90 p-2 text-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900/90">
        <MessageSquareText className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[95vw] sm:max-w-xl flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200/70 dark:border-slate-800/60">
          <div className="flex items-center justify-between gap-2">
            <div>
              <SheetTitle>Comments on {" "}
                <span className="font-bold">{pokemonName}</span></SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Comments Area */}
        {!collapsed && (
          <ScrollArea className="flex-1 min-h-0 px-6 py-4">
            <ErrorBoundary
              onReset={() => {
                queryClient.invalidateQueries({ queryKey: ["comments", stableKey] });
                queryClient.invalidateQueries({ queryKey: ["userVotes", stableKey] });
              }}
            >
              <CommentList messageId={stableKey} />
            </ErrorBoundary>
          </ScrollArea>
        )}

        {/* Fixed Input at Bottom */}
        {!collapsed && (
          <div className="border-t border-slate-200/70 dark:border-slate-800/60 px-6 py-4 bg-background">
            <CommentInput
              messageId={stableKey}
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// error boundary for comments
import React from "react";
class ErrorBoundary extends React.Component<
  { onReset?: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    toast.error("Something went wrong in comments.");
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 text-center text-sm">
          <p>There was an error loading comments.</p>
          <button
            className="mt-3 inline-flex rounded-md border px-3 py-1.5"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset?.();
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children as any;
  }
}
