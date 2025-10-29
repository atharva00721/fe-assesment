"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { ArrowUpIcon, ImageIcon, X } from "lucide-react";
import type { Comment } from "./types";

type CommentInputProps = {
  messageId: string;
  initialComment?: Comment;
  onCancel?: () => void;
  onSubmit: (data: { content: string; author: string }) => void;
  isLoading?: boolean;
};

export function CommentInput({
  messageId,
  initialComment,
  onCancel,
  onSubmit,
  isLoading = false,
}: CommentInputProps) {
  // Initialize state with initial values
  const [content, setContent] = useState(() => {
    return initialComment?.content ?? "";
  });
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevInitialCommentRef = useRef(initialComment);

  // Sync state when initialComment changes (for edit mode)
  useEffect(() => {
    const prevComment = prevInitialCommentRef.current;
    if (initialComment && initialComment !== prevComment) {
      // Use requestAnimationFrame to defer state update outside of effect
      requestAnimationFrame(() => {
        setContent(initialComment.content);
      });
    }
    prevInitialCommentRef.current = initialComment;
  }, [initialComment]);

  // Auto-focus textarea when editing
  useEffect(() => {
    if (initialComment && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [initialComment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Comment cannot be empty");
      return;
    }

    // Always use "Anonymous" as the author
    onSubmit({
      content: trimmedContent,
      author: "Anonymous",
    });

    // Reset form if creating new comment
    if (!initialComment) {
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim() && !isLoading) {
        // Create a synthetic form event for handleSubmit
        const form = e.currentTarget.form;
        if (form) {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
          Object.defineProperty(formEvent, "currentTarget", { value: form, writable: false });
          Object.defineProperty(formEvent, "target", { value: form, writable: false });
          handleSubmit(formEvent);
        }
      }
    }
    if (e.key === "Escape" && initialComment && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  const isEditMode = !!initialComment;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="text-sm text-destructive px-1">{error}</div>
      )}
      <InputGroup className="bg-background">
        <InputGroupTextarea
          ref={textareaRef}
          placeholder={isEditMode ? "Edit your comment..." : "What are your thoughts?"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="min-h-[60px] resize-none bg-transparent text-base leading-6 focus-visible:ring-0 dark:bg-transparent"
          aria-label={isEditMode ? "Edit comment" : "Write a comment"}
        />
        <InputGroupAddon align="block-end" className="gap-2">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            type="button"
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Upload media"
            title="Upload media (coming soon)"
          >
            <ImageIcon className="size-3.5" />
            <span className="sr-only">Upload media</span>
          </InputGroupButton>
          <div className="ml-auto flex items-center gap-2">
            {isEditMode && onCancel && (
              <>
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  aria-label="Cancel editing"
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Cancel</span>
                </InputGroupButton>
                <Separator orientation="vertical" className="h-4" />
              </>
            )}
            <InputGroupButton
              variant="default"
              className="rounded-full"
              size="icon-sm"
              type="submit"
              disabled={!content.trim() || isLoading}
              aria-label={isEditMode ? "Save changes" : "Post comment"}
            >
              <ArrowUpIcon className="size-3.5" />
              <span className="sr-only">{isEditMode ? "Save" : "Post"}</span>
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

