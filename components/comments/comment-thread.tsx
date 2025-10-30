"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CommentItem } from "./comment-item";
import type { Comment, UserVote } from "./types";

export type CommentNode = {
    comment: Comment;
    children: CommentNode[];
};

type CommentThreadProps = {
    messageId: string;
    nodes: CommentNode[];
    userVotes: Record<string, UserVote>;
    onEdit: (commentId: string, data: { content: string; author: string }) => void;
    onDelete: (commentId: string) => void;
    onVote: (commentId: string, vote: UserVote | null) => void;
    onReply: (parentId: string, content: string, author: string) => void;
    depth?: number; // 0 for root
    maxDepth?: number; // default 4 => depths 0..4 (5 levels)
};

export function CommentThread({
    messageId,
    nodes,
    userVotes,
    onEdit,
    onDelete,
    onVote,
    onReply,
    depth = 0,
    maxDepth = 4,
}: CommentThreadProps) {
    if (!nodes || nodes.length === 0) return null;

    const indentPx = Math.min(depth * 14, 14 * 8); // cap visual indent
    const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        for (const n of nodes) {
            if (n.children && n.children.length > 0) {
                initial[n.comment.id] = true; // replies collapsed by default
            }
        }
        return initial;
    });
    const toggle = (id: string) => setCollapsedById((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <ul className={depth > 0 ? "space-y-2" : "space-y-2"}>
            {nodes.map((node) => {
                const canReply = depth < maxDepth;
                const vote = userVotes[node.comment.id] ?? null;
                const isCollapsed = collapsedById[node.comment.id] !== false; // default collapsed
                const repliesCount = node.children?.length || 0;
                const label = isCollapsed
                    ? `Show ${repliesCount} repl${repliesCount === 1 ? "y" : "ies"}`
                    : `Hide repl${repliesCount === 1 ? "y" : "ies"}`;
                return (
                    <li key={node.comment.id} className="animate-in fade-in slide-in-from-bottom-1">
                        <div className={depth > 0 ? "border-l border-slate-200/70 dark:border-slate-800/60" : ""} style={depth > 0 ? { paddingLeft: indentPx } : undefined}>
                            <CommentItem
                                comment={node.comment}
                                messageId={messageId}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onVote={onVote}
                                userVote={vote}
                                canReply={canReply}
                                onReply={(parentId, data) => onReply(parentId, data.content, data.author)}
                                repliesToggle={
                                    repliesCount > 0 ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                                            onClick={() => toggle(node.comment.id)}
                                            aria-expanded={!isCollapsed}
                                        >
                                            {isCollapsed ? (
                                                <ChevronRight className="size-3 mr-1" />
                                            ) : (
                                                <ChevronDown className="size-3 mr-1" />
                                            )}
                                            {label}
                                        </Button>
                                    ) : null
                                }
                            />
                            {node.children && node.children.length > 0 && !isCollapsed && (
                                <CommentThread
                                    messageId={messageId}
                                    nodes={node.children}
                                    userVotes={userVotes}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onVote={onVote}
                                    onReply={onReply}
                                    depth={depth + 1}
                                    maxDepth={maxDepth}
                                />
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}


