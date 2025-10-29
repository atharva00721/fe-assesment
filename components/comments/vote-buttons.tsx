"use client";

import { Button } from "@/components/ui/button";
import type { UserVote } from "./types";
import { ChevronUp, ChevronDown } from "lucide-react";

type VoteButtonsProps = {
    score: number;
    userVote: UserVote | null;
    disabled?: boolean;
    onUpvote: () => void;
    onDownvote: () => void;
    className?: string;
};

export function VoteButtons({
    score,
    userVote,
    disabled = false,
    onUpvote,
    onDownvote,
    className,
}: VoteButtonsProps) {
    const upActive = userVote === "up";
    const downActive = userVote === "down";

    return (
        <div className={className ?? "flex flex-col items-center gap-1 pt-1"}>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={onUpvote}
                disabled={disabled}
                className={
                    "h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20 " +
                    (upActive ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20" : "")
                }
                aria-label="Upvote"
            >
                <ChevronUp className="size-4" />
            </Button>
            <span className="text-xs font-medium text-slate-900 dark:text-slate-50 min-w-4 text-center">
                {score}
            </span>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDownvote}
                disabled={disabled}
                className={
                    "h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 " +
                    (downActive ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" : "")
                }
                aria-label="Downvote"
            >
                <ChevronDown className="size-4" />
            </Button>
        </div>
    );
}


