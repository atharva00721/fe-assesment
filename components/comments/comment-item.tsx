"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentInput } from "./comment-input";
import type { Comment, UserVote } from "./types";
import { Reply, X, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoteButtons } from "./vote-buttons";

type CommentItemProps = {
  comment: Comment;
  messageId: string;
  onEdit: (commentId: string, data: { content: string; author: string }) => void;
  onDelete: (commentId: string) => void;
  onVote: (commentId: string, vote: UserVote | null) => void;
  userVote?: UserVote | null;
  canReply?: boolean;
  onReply?: (parentId: string, data: { content: string; author: string }) => void;
  repliesToggle?: React.ReactNode;
  isEditing?: boolean;
  isLoading?: boolean;
};

// Format timestamp for display
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
}

// Get initials from author name
function getInitials(author: string): string {
  return author
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CommentItem({
  comment,
  messageId,
  onEdit,
  onDelete,
  onVote,
  userVote = null,
  canReply = true,
  onReply,
  repliesToggle,
  isEditing: externalIsEditing,
  isLoading = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(externalIsEditing || false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const handleEditSubmit = (data: { content: string; author: string }) => {
    onEdit(comment.id, data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(comment.id);
    setIsDeleting(false);
  };

  if (isEditing) {
    return (
      <div className="py-2">
        <CommentInput
          messageId={messageId}
          initialComment={comment}
          onCancel={handleCancel}
          onSubmit={handleEditSubmit}
          isLoading={isLoading}
        />
      </div>
    );
  }

  const voteScore = comment.upvotes - comment.downvotes;
  const isDeleted = comment.content === "{DELETED COMMENT}";

  return (
    <div className="flex gap-2 py-2">
      {/* Voting Section */}
      <VoteButtons
        score={voteScore}
        userVote={userVote}
        disabled={isLoading}
        onUpvote={() => onVote(comment.id, "up")}
        onDownvote={() => onVote(comment.id, "down")}
      />

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700">
              {getInitials(comment.author)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-slate-900 dark:text-slate-50 hover:underline cursor-pointer">
            {comment.author}
          </span>
          <span
            className="text-xs text-slate-500 dark:text-slate-400"
            title={new Date(comment.timestamp).toLocaleString()}
          >
            {formatDistanceToNowStrict(new Date(comment.timestamp), { addSuffix: true })}
          </span>
        </div>

        {/* Comment Body */}
        <p
          className={
            isDeleted
              ? "text-sm text-slate-500 dark:text-slate-500 mb-2 italic"
              : "text-sm text-slate-900 dark:text-slate-50 mb-2 whitespace-pre-wrap wrap-break-word break-all sm:wrap-break-word"
          }
        >
          {comment.content}
        </p>

        {/* Action Bar */}
        {!isDeleted && (
          <div className="flex items-center gap-1">
            {canReply && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => setIsReplying((s) => !s)}
                disabled={isLoading}
                aria-label={isReplying ? "Cancel reply" : "Reply"}
                title={isReplying ? "Cancel reply" : "Reply"}
              >
                {isReplying ? <X className="size-3" /> : <Reply className="size-3" />}
              </Button>
            )}
            {repliesToggle}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Pencil className="size-3 mr-1" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="size-3" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {isReplying && canReply && onReply && !isDeleted && (
          <div className="mt-2">
            <CommentInput
              messageId={messageId}
              onSubmit={(data) => {
                onReply(comment.id, data);
                setIsReplying(false);
              }}
              onCancel={() => setIsReplying(false)}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

