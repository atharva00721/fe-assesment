"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { CommentItem } from "./comment-item";
import { CommentThread, type CommentNode } from "./comment-thread";
import {
  getCommentsForMessage,
  saveCommentsForMessage,
  getUserVotes,
  saveUserVotes,
} from "./comment-storage";
import type { Comment, UserVote } from "./types";
import { SortControls, type SortValue } from "./sort-controls";
import {
  nextVote as computeNextVote,
  applyVote as applyVoteToList,
  sortComments,
  buildCommentTree,
} from "@/lib/comments/utils";
import { CommentsSkeleton } from "./skeleton-list";
import { EmptyComments } from "./empty-state";
import { usePersistedSort } from "@/hooks/comments";

type CommentListProps = {
  messageId: string;
};

export function CommentList({ messageId }: CommentListProps) {
  const queryClient = useQueryClient();

  // Sort state (persist per message)
  const [sort, setSort] = usePersistedSort(messageId);

  // Fetch comments
  const { data: comments = [], isFetching: isFetchingComments } = useQuery<Comment[]>({
    queryKey: ["comments", messageId],
    queryFn: () => getCommentsForMessage(messageId),
    staleTime: 0, // Always read fresh from localStorage
  });

  // Fetch user votes for this message (stable key)
  const userVotesQuery = useQuery<Record<string, UserVote>>({
    queryKey: ["userVotes", messageId],
    queryFn: () => getUserVotes(messageId),
    staleTime: 0,
  });
  const userVotes = userVotesQuery.data || ({} as Record<string, UserVote>);
  const isFetchingVotes = userVotesQuery.isFetching;

  // moved to utils.ts: nextVote, applyVote

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ commentId, vote }: { commentId: string; vote: UserVote | null }) => {
      const currentVotes = getUserVotes(messageId);
      const currentVote = (currentVotes[commentId] as UserVote | undefined) ?? null;
      const updatedVotes: Record<string, UserVote> = { ...currentVotes };
      if (vote === null) {
        delete updatedVotes[commentId];
      } else {
        updatedVotes[commentId] = vote;
      }
      const currentComments = getCommentsForMessage(messageId);
      const updatedComments = applyVoteToList(currentComments, commentId, currentVote, vote);
      const ok1 = saveCommentsForMessage(messageId, updatedComments);
      const ok2 = saveUserVotes(messageId, updatedVotes);
      if (!ok1 || !ok2) throw new Error("quota");
      return { comments: updatedComments, votes: updatedVotes };
    },
    onMutate: async ({ commentId, vote }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", messageId] });
      await queryClient.cancelQueries({ queryKey: ["userVotes", messageId] });

      const previousComments = queryClient.getQueryData<Comment[]>(["comments", messageId]);
      const previousVotes = queryClient.getQueryData<Record<string, UserVote>>([
        "userVotes",
        messageId,
      ]);

      const currentVote = (previousVotes?.[commentId] as UserVote | undefined) ?? null;
      const next = vote; // already computed by caller

      // optimistic updates
      const optimisticComments = applyVoteToList(previousComments || [], commentId, currentVote, next);
      const optimisticVotes: Record<string, UserVote> = { ...(previousVotes || {}) };
      if (next === null) {
        delete optimisticVotes[commentId];
      } else {
        optimisticVotes[commentId] = next;
      }

      queryClient.setQueryData<Comment[]>(["comments", messageId], optimisticComments);
      queryClient.setQueryData<Record<string, UserVote>>([
        "userVotes",
        messageId,
      ], optimisticVotes);

      return { previousComments, previousVotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", messageId], context.previousComments);
      }
      if (context?.previousVotes) {
        queryClient.setQueryData(["userVotes", messageId], context.previousVotes);
      }
      toast.error("Couldn't register vote. Restored previous state.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
      queryClient.invalidateQueries({ queryKey: ["userVotes", messageId] });
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
  });

  // Update comment mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: { content: string; author: string };
    }) => {
      const currentComments = getCommentsForMessage(messageId);
      const updatedComments = currentComments.map((c) =>
        c.id === commentId
          ? { ...c, content: data.content, author: data.author }
          : c
      );
      const ok = saveCommentsForMessage(messageId, updatedComments);
      if (!ok) throw new Error("quota");
      return updatedComments;
    },
    onMutate: async ({ commentId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", messageId] });

      const previous = queryClient.getQueryData<Comment[]>([
        "comments",
        messageId,
      ]);

      // Optimistically update
      const optimisticComments = (previous || []).map((c) =>
        c.id === commentId ? { ...c, content: data.content, author: data.author } : c
      );
      queryClient.setQueryData<Comment[]>(["comments", messageId], optimisticComments);

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", messageId], context.previous);
      }
      toast.error("Couldn't update comment. Restored previous state.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
  });

  // Delete comment mutation (tombstone): keep node so children remain
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const currentComments = getCommentsForMessage(messageId);
      const updatedComments = currentComments.map((c) =>
        c.id === commentId ? { ...c, content: "{DELETED COMMENT}" } : c
      );
      const ok = saveCommentsForMessage(messageId, updatedComments);
      if (!ok) throw new Error("quota");
      return updatedComments;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", messageId] });

      const previous = queryClient.getQueryData<Comment[]>(["comments", messageId]);

      // Optimistically tombstone instead of removing
      const optimisticComments = (previous || []).map((c) =>
        c.id === commentId ? { ...c, content: "{DELETED COMMENT}" } : c
      );
      queryClient.setQueryData<Comment[]>(["comments", messageId], optimisticComments);

      return { previous };
    },
    onError: (err, commentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", messageId], context.previous);
      }
      toast.error("Couldn't delete comment. Restored previous state.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
      toast.success("Comment deleted.");
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
  });

  // Create reply mutation (like create, but sets parentId)
  const createReplyMutation = useMutation({
    mutationFn: async ({
      parentId,
      content,
      author,
    }: {
      parentId: string;
      content: string;
      author: string;
    }) => {
      const current = getCommentsForMessage(messageId);
      const newComment: Comment = {
        id: crypto.randomUUID(),
        content,
        author,
        timestamp: Date.now(),
        parentId,
        upvotes: 0,
        downvotes: 0,
      };
      const updated = [...current, newComment];
      const ok = saveCommentsForMessage(messageId, updated);
      if (!ok) throw new Error("quota");
      return updated;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["comments", messageId] });
      const previous = queryClient.getQueryData<Comment[]>(["comments", messageId]);
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        content: variables.content,
        author: variables.author,
        timestamp: Date.now(),
        parentId: variables.parentId,
        upvotes: 0,
        downvotes: 0,
      };
      queryClient.setQueryData<Comment[]>(
        ["comments", messageId],
        [...(previous || []), optimistic]
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", messageId], context.previous);
      }
      toast.error("Couldn't post reply. Restored previous state.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
      toast.success("Reply posted.");
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
  });

  // Apply sorting
  const sortedComments = useMemo(() => {
    return sortComments(comments, sort);
  }, [comments, sort]);

  // Build tree (2 levels)
  const tree = useMemo<CommentNode[]>(() => buildCommentTree(sortedComments, sort), [sortedComments, sort]);

  const isLoading =
    updateMutation.isPending ||
    deleteMutation.isPending;

  const isInitialLoading = isFetchingComments || isFetchingVotes;

  return (
    <>
      {/* Sort Controls */}
      <div className="mb-2 flex items-center justify-between">
        <SortControls value={sort} onChange={setSort} />
      </div>
      {isInitialLoading ? (
        <CommentsSkeleton />
      ) : sortedComments.length === 0 ? (
        <EmptyComments />
      ) : (
        <CommentThread
          messageId={messageId}
          nodes={tree}
          userVotes={userVotes}
          onEdit={(commentId, data) => updateMutation.mutate({ commentId, data })}
          onDelete={(commentId) => deleteMutation.mutate(commentId)}
          onVote={(commentId, target) => {
            const current = (userVotes?.[commentId] as UserVote | undefined) ?? null;
            const next = computeNextVote(current, (target || "up") as UserVote);
            voteMutation.mutate({ commentId, vote: next });
          }}
          onReply={(parentId, content, author) => {
            createReplyMutation.mutate({ parentId, content, author });
          }}
          maxDepth={6}
        />
      )}
    </>
  );
}

