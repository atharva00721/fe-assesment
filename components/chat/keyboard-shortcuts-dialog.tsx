"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export default function KeyboardShortcutsDialog() {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  
  // Detect Mac for keyboard shortcut display
  const isMac = typeof window !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

  // Global keyboard shortcut to open dialog
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      // Ctrl/Cmd + / to show keyboard shortcuts (works everywhere, even in inputs)
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        event.stopPropagation();
        setShowShortcutsDialog((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase to catch before input handlers
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, []);

  return (
    <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the chat interface.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Input & Navigation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Focus input</span>
                <KbdGroup>
                  <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Show keyboard shortcuts</span>
                <KbdGroup>
                  <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
                  <Kbd>/</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Submit message</span>
                <KbdGroup>
                  <Kbd>Enter</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Submit message (alternative)</span>
                <KbdGroup>
                  <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
                  <Kbd>Enter</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">New line</span>
                <KbdGroup>
                  <Kbd>Shift</Kbd>
                  <Kbd>Enter</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Clear input</span>
                <KbdGroup>
                  <Kbd>Esc</Kbd>
                </KbdGroup>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Search Results
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Navigate down</span>
                <KbdGroup>
                  <Kbd>↓</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Navigate up</span>
                <KbdGroup>
                  <Kbd>↑</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Select highlighted result</span>
                <KbdGroup>
                  <Kbd>Enter</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Close search results</span>
                <KbdGroup>
                  <Kbd>Esc</Kbd>
                </KbdGroup>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Conversation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Toggle expand/collapse question</span>
                <KbdGroup>
                  <Kbd>Enter</Kbd>
                  <span className="text-slate-400 dark:text-slate-500">or</span>
                  <Kbd>Space</Kbd>
                </KbdGroup>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

