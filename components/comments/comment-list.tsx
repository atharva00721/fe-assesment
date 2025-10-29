"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentItem } from "./comment-item";
import {
  getCommentsForMessage,
  saveCommentsForMessage,
  getUserVotes,
  saveUserVotes,
} from "./comment-storage";
import type { Comment, UserVote } from "./types";

type CommentListProps = {
  messageId: string;
};

export function CommentList({ messageId }: CommentListProps) {
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["comments", messageId],
    queryFn: () => getCommentsForMessage(messageId),
    staleTime: 0, // Always read fresh from localStorage
  });

  // Fetch user votes for this message (stable key)
  const { data: userVotes = {} } = useQuery<Record<string, UserVote>>({
    queryKey: ["userVotes", messageId],
    queryFn: () => getUserVotes(messageId),
    staleTime: 0,
  });

  function nextVote(current: UserVote | null, target: UserVote): UserVote | null {
    if (current === target) return null; // toggle off
    return target; // switch or set
  }

  function applyVote(
    list: Comment[],
    commentId: string,
    from: UserVote | null,
    to: UserVote | null
  ): Comment[] {
    return list.map((c) => {
      if (c.id !== commentId) return c;
      let up = c.upvotes;
      let down = c.downvotes;
      // remove previous
      if (from === "up") up -= 1;
      if (from === "down") down -= 1;
      // add new
      if (to === "up") up += 1;
      if (to === "down") down += 1;
      return { ...c, upvotes: Math.max(0, up), downvotes: Math.max(0, down) };
    });
  }

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
      const updatedComments = applyVote(currentComments, commentId, currentVote, vote);
      saveCommentsForMessage(messageId, updatedComments);
      saveUserVotes(messageId, updatedVotes);
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
      const optimisticComments = applyVote(previousComments || [], commentId, currentVote, next);
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
      queryClient.invalidateQueries({ queryKey: ["userVotes", messageId] });
    },
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
      saveCommentsForMessage(messageId, updatedComments);
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const currentComments = getCommentsForMessage(messageId);
      const updatedComments = currentComments.filter((c) => c.id !== commentId);
      saveCommentsForMessage(messageId, updatedComments);
      return updatedComments;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", messageId] });

      const previous = queryClient.getQueryData<Comment[]>([
        "comments",
        messageId,
      ]);

      // Optimistically remove
      const optimisticComments = (previous || []).filter(
        (c) => c.id !== commentId
      );
      queryClient.setQueryData<Comment[]>(["comments", messageId], optimisticComments);

      return { previous };
    },
    onError: (err, commentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", messageId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", messageId] });
    },
  });

  // Sort comments: newest first
  const sortedComments = [...comments].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const isLoading =
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      {sortedComments.length === 0 ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm">No comments yet.</p>
          <p className="text-xs mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="border-b border-slate-200/50 dark:border-slate-800/50 last:border-b-0">
              <CommentItem
                comment={comment}
                messageId={messageId}
                onEdit={(commentId, data) =>
                  updateMutation.mutate({ commentId, data })
                }
                onDelete={(commentId) => deleteMutation.mutate(commentId)}
                onVote={(commentId: string, target: UserVote | null) => {
                  const current = (userVotes?.[commentId] as UserVote | undefined) ?? null;
                  const next = nextVote(current, (target || "up") as UserVote);
                  voteMutation.mutate({ commentId, vote: next });
                }}
                userVote={(userVotes?.[comment.id] as UserVote | undefined) ?? null}
                isLoading={isLoading}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

