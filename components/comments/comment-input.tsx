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
import { MAX_CONTENT_LENGTH } from "./types";

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
  const MAX_TEXTAREA_HEIGHT_PX = 160;
  const MIN_TEXTAREA_HEIGHT_PX = 40;

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(MAX_TEXTAREA_HEIGHT_PX, textarea.scrollHeight);
    const finalHeight = Math.max(MIN_TEXTAREA_HEIGHT_PX, nextHeight);
    textarea.style.height = `${finalHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT_PX ? "auto" : "hidden";
  };

  // Sync state when initialComment changes (for edit mode)
  useEffect(() => {
    const prevComment = prevInitialCommentRef.current;
    if (initialComment && initialComment !== prevComment) {
      // Use requestAnimationFrame to defer state update outside of effect
      requestAnimationFrame(() => {
        setContent(initialComment.content);
        // Ensure height syncs after content update on edit mode
        requestAnimationFrame(resizeTextarea);
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

  // Resize when content changes or on mount
  useEffect(() => {
    resizeTextarea();
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Comment cannot be empty");
      return;
    }
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      setError(`Comment is too long (max ${MAX_CONTENT_LENGTH} characters)`);
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
          onInput={resizeTextarea}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          className="min-h-[40px] max-h-[160px] resize-none bg-transparent text-base leading-6 focus-visible:ring-0 dark:bg-transparent overflow-y-auto"
          aria-label={isEditMode ? "Edit comment" : "Write a comment"}
        />
        <InputGroupAddon align="block-end" className="gap-2">
          <InputGroupText className="text-[10px] text-slate-500 dark:text-slate-400">
            {content.length}/{MAX_CONTENT_LENGTH}
          </InputGroupText>

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
              disabled={!content.trim() || content.trim().length > MAX_CONTENT_LENGTH || isLoading}
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

