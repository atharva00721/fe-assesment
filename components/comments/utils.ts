import type { Comment, UserVote } from "./types";

export function nextVote(current: UserVote | null, target: UserVote): UserVote | null {
    if (current === target) return null;
    return target;
}

export function applyVote(
    list: Comment[],
    commentId: string,
    from: UserVote | null,
    to: UserVote | null
): Comment[] {
    return list.map((c) => {
        if (c.id !== commentId) return c;
        let up = c.upvotes;
        let down = c.downvotes;
        if (from === "up") up -= 1;
        if (from === "down") down -= 1;
        if (to === "up") up += 1;
        if (to === "down") down += 1;
        return { ...c, upvotes: Math.max(0, up), downvotes: Math.max(0, down) };
    });
}

export const sortByNewest = (a: Comment, b: Comment) => b.timestamp - a.timestamp;
export const sortByOldest = (a: Comment, b: Comment) => a.timestamp - b.timestamp;
export const score = (c: Comment) => c.upvotes - c.downvotes;
export const sortByVotes = (a: Comment, b: Comment) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return b.timestamp - a.timestamp;
};

export type SortKind = "new" | "old" | "top";

export function sortComments(list: Comment[], kind: SortKind): Comment[] {
    const copy = [...list];
    switch (kind) {
        case "old":
            return copy.sort(sortByOldest);
        case "top":
            return copy.sort(sortByVotes);
        case "new":
        default:
            return copy.sort(sortByNewest);
    }
}

export type CommentNode = { comment: Comment; children: CommentNode[] };

export function buildCommentTree(sorted: Comment[], kind: SortKind): CommentNode[] {
    const byParent = new Map<string | null, Comment[]>();
    for (const c of sorted) {
        const key = c.parentId ?? null;
        const arr = byParent.get(key) || [];
        arr.push(c);
        byParent.set(key, arr);
    }
    const sortLevel = (arr: Comment[]) => sortComments(arr, kind);
    const roots = sortLevel(byParent.get(null) || []);
    const toNode = (c: Comment): CommentNode => ({
        comment: c,
        children: sortLevel(byParent.get(c.id) || []).map(toNode),
    });
    return roots.map(toNode);
}


