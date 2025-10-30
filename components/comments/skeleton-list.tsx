export function CommentsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-2 py-2 animate-pulse">
          <div className="w-6 shrink-0">
            <div className="h-6 w-6 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-4 mt-1 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-6 mt-1 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}


