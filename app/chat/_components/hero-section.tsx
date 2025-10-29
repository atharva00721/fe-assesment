"use client";

import { ArrowRightIcon } from "lucide-react";

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

type HeroSectionProps = {
  quickQuestions: string[];
  onQuickQuestion: (question: string) => void;
};

export const HeroSection = ({ quickQuestions, onQuickQuestion }: HeroSectionProps) => {
  return (
    <section className="relative isolate px-6 pb-16 pt-20">
      <div className="absolute inset-0 -z-10 flex items-center justify-between opacity-60">
        <div className="hidden h-full w-[40%] max-w-lg rounded-[4rem] bg-linear-to-b from-slate-200/40 via-white/40 to-transparent blur-2xl dark:from-slate-900/50 dark:via-slate-900/30 lg:block" />
        <div className="hidden h-full w-[40%] max-w-lg rounded-[4rem] bg-linear-to-b from-slate-200/40 via-white/40 to-transparent blur-2xl dark:from-slate-900/50 dark:via-slate-900/30 lg:block" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            AI chat workspace
          </p>
          <h1 className="text-balance text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            A simple interface for smarter conversations.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-500 sm:text-lg dark:text-slate-400">
            Ask questions, brainstorm ideas, and keep context in one place. Launch the conversation below or use a quick prompt to get started.
          </p>
        </div>

        <div className="w-full max-w-3xl space-y-3">
          <p className="text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Quick prompts
          </p>
          <Suggestions className="mx-auto gap-3">
            {quickQuestions.map((question) => (
              <Suggestion
                key={question}
                suggestion={question}
                onClick={onQuickQuestion}
                size="sm"
                className="inline-flex items-center gap-2 border border-slate-200 bg-white text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400/70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ArrowRightIcon className="size-3" />
                {question}
              </Suggestion>
            ))}
          </Suggestions>
        </div>
      </div>
    </section>
  );
};