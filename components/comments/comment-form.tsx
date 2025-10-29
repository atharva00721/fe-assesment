"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Comment } from "./types";

type CommentFormProps = {
  messageId: string;
  initialComment?: Comment;
  onCancel?: () => void;
  onSuccess?: () => void;
  onSubmit: (data: { content: string; author: string }) => void;
  isLoading?: boolean;
};

export function CommentForm({
  messageId,
  initialComment,
  onCancel,
  onSuccess,
  onSubmit,
  isLoading = false,
}: CommentFormProps) {
  // Initialize state with initial values or localStorage
  const [content, setContent] = useState(() => {
    return initialComment?.content ?? "";
  });
  const [author, setAuthor] = useState(() => {
    if (initialComment) {
      return initialComment.author;
    }
    // Try to load saved author from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("comment-author") ?? "";
    }
    return "";
  });
  const [error, setError] = useState("");
  const prevInitialCommentRef = useRef(initialComment);

  // Sync state when initialComment changes (for edit mode)
  useEffect(() => {
    const prevComment = prevInitialCommentRef.current;
    if (initialComment && initialComment !== prevComment) {
      // Use requestAnimationFrame to defer state update outside of effect
      requestAnimationFrame(() => {
        setContent(initialComment.content);
        setAuthor(initialComment.author);
      });
    }
    prevInitialCommentRef.current = initialComment;
  }, [initialComment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Comment content is required");
      return;
    }

    const trimmedAuthor = author.trim() || "Anonymous";

    // Save author preference
    if (typeof window !== "undefined" && !initialComment) {
      localStorage.setItem("comment-author", trimmedAuthor);
    }

    onSubmit({
      content: trimmedContent,
      author: trimmedAuthor,
    });

    // Call onSuccess callback
    if (onSuccess) {
      onSuccess();
    }

    // Reset form if creating new comment
    if (!initialComment) {
      setContent("");
      // Keep author for next comment
    }
  };

  const isEditMode = !!initialComment;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`author-${messageId}`}>Author</Label>
        <Input
          id={`author-${messageId}`}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Anonymous"
          disabled={isLoading}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`content-${messageId}`}>
          Comment <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`content-${messageId}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          disabled={isLoading}
          className="min-h-24 w-full resize-none"
          rows={4}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditMode ? "Update" : "Post Comment"}
        </Button>
        {isEditMode && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

