"use client";

import { useActiveTurn } from "./active-turn-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { Message } from "./types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquareText } from "lucide-react";

async function fetchComments(key: string | null) {
  if (!key) return [];
  const res = await fetch(`/api/comments?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Extract Pokémon name from question text (e.g., "Who is Blastoise?" -> "Blastoise")
function extractPokemonName(question: string | null): string {
  if (!question) return "Pokémon";
  const match = question.match(/(?:Who|What) is\s+(.+?)\?/i);
  return match ? match[1] : "Pokémon";
}

// Mock comment data
const MOCK_COMMENTS = [
  {
    id: "1",
    text: "This Pokémon is amazing! Love its design.",
    author: "TrainerAsh",
    votes: 42,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    text: "Great stats, but could use better moveset.",
    author: "PokemonMaster",
    votes: 18,
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    text: "Best starter Pokémon choice!",
    author: "GymLeader",
    votes: 67,
    timestamp: "1 day ago",
  },
  {
    id: "4",
    text: "The evolution line is really well designed.",
    author: "PokeFan",
    votes: 35,
    timestamp: "2 days ago",
  },
  {
    id: "5",
    text: "Used this in my championship team!",
    author: "EliteTrainer",
    votes: 29,
    timestamp: "3 days ago",
  },
];

export default function CommentsPanel() {
  const { activeTurnId, activeTurnMessage } = useActiveTurn();

  // Extract Pokémon name from question text
  const pokemonName = useMemo(() => {
    if (!activeTurnMessage?.content) return "Pokémon";
    return extractPokemonName(activeTurnMessage.content);
  }, [activeTurnMessage]);

  // Debug: Log active turn changes
  useEffect(() => {
    console.log("[CommentsPanel] Active turn ID:", activeTurnId);
    console.log("[CommentsPanel] Fetching comments for:", activeTurnId || "none");
  }, [activeTurnId]);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", activeTurnId],
    queryFn: () => {
      console.log("[CommentsPanel] Fetching comments for key:", activeTurnId);
      return fetchComments(activeTurnId);
    },
    enabled: Boolean(activeTurnId),
  });

  // Use mock data for now
  const displayComments = MOCK_COMMENTS;

  // Debug: Log comments data
  useEffect(() => {
    console.log("[CommentsPanel] Comments data:", comments, "Loading:", isLoading);
  }, [comments, isLoading]);

  if (!activeTurnId) return null;

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-900/90">
        <MessageSquareText className="size-4" />
        Comments
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription>{pokemonName}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-slate-500 dark:text-slate-400">Loading...</div>
          ) : displayComments.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400">No comments yet.</div>
          ) : (
            <ul className="space-y-4">
              {displayComments.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-800/50">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {c.author}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
                    {c.text}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>▲ {c.votes}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
