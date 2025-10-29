"use client";

import { useActiveTurn } from "./active-turn-context";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText } from "lucide-react";
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

export default function CommentsPanel() {
  const { activeTurnId, activeTurnMessage } = useActiveTurn();
  const queryClient = useQueryClient();

  // Extract Pokémon name from question text
  const pokemonName = useMemo(() => {
    if (!activeTurnMessage?.content) return "Pokémon";
    return extractPokemonName(activeTurnMessage.content);
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
      saveCommentsForMessage(stableKey, updatedComments);
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
    },
    onSuccess: () => {
      if (stableKey) {
        queryClient.invalidateQueries({ queryKey: ["comments", stableKey] });
      }
    },
  });

  if (!activeTurnId || !stableKey) return null;

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900/90">
        <MessageSquareText className="size-4" />
        Comments
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200/70 dark:border-slate-800/60">
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription>{pokemonName}</SheetDescription>
        </SheetHeader>

        {/* Scrollable Comments Area */}
        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          <CommentList messageId={stableKey} />
        </ScrollArea>

        {/* Fixed Input at Bottom */}
        <div className="border-t border-slate-200/70 dark:border-slate-800/60 px-6 py-4 bg-background">
          <CommentInput
            messageId={stableKey}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
