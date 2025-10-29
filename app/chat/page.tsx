"use client";

import {
  useCallback,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import ConversationSection from "./_components/conversation-section";
import PromptSection from "./_components/prompt-section";
import type { ConversationMode, Message } from "./_components/types";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ConversationMode>("Auto");
  const [isResponding, setIsResponding] = useState(false);
  const [panelInputValue, setPanelInputValue] = useState("");

  const sendMessage = useCallback(
    (rawContent: string) => {
      const trimmed = rawContent.trim();

      if (!trimmed) {
        return;
      }

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
      };

      const responseCopy =
        mode === "Auto"
          ? `Auto mode heard: “${trimmed}”.`
          : mode === "Agent"
            ? `Agent mode is on it: “${trimmed}”.`
            : `Manual mode queued your prompt: “${trimmed}”.`;

      setMessages((prev) => [...prev, userMessage]);
      setIsResponding(true);

      window.setTimeout(() => {
        const formattedResponse = `# ${mode} reply\n\n${trimmed}\n\n---\n\n- Mode: **${mode}**\n- Length: **${trimmed.length}** characters`;

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: formattedResponse,
          },
        ]);
        setIsResponding(false);
      }, 500);
    },
    [mode],
  );

  const handlePanelSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!panelInputValue.trim()) {
        return;
      }

      sendMessage(panelInputValue);
      setPanelInputValue("");
    },
    [panelInputValue, sendMessage],
  );

  const handlePanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!panelInputValue.trim()) {
          return;
        }
        sendMessage(panelInputValue);
        setPanelInputValue("");
      }
    },
    [panelInputValue, sendMessage],
  );

  const handlePanelInputChange = useCallback((value: string) => {
    setPanelInputValue(value);
  }, [setPanelInputValue]);

  const handleModeSelect = useCallback((nextMode: ConversationMode) => {
    setMode(nextMode);
  }, [setMode]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="z-10 border-b h-[60px] flex items-center justify-center border-slate-200/70 bg-white/80 backdrop-blur px-6 py-6 dark:border-slate-800/60 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Simple Chat
              </p>
            </div>
          </div>

        </div>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-60px)] flex-col items-center justify-center">
        <div className="flex h-full w-full items-center justify-center">
          <ConversationSection messages={messages} isResponding={isResponding} />
        </div>
        <PromptSection
          mode={mode}
          value={panelInputValue}
          isResponding={isResponding}
          onSubmit={handlePanelSubmit}
          onChange={handlePanelInputChange}
          onKeyDown={handlePanelKeyDown}
          onModeSelect={handleModeSelect}
          placement={messages.length > 0 ? "docked" : "floating"}
        />
      </main>
    </div>
  );
}
