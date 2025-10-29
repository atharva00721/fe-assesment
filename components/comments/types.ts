export type Comment = {
  id: string;
  content: string;
  author: string;
  timestamp: number; // ms since epoch
  parentId: string | null;
  upvotes: number;
  downvotes: number;
};

export type UserVote = "up" | "down";

export type CommentList = Comment[];

