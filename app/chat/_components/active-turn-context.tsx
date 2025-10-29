"use client";

import { createContext, useContext } from "react";
import type { Message } from "./types";

export type ActiveTurnContextValue = {
  activeTurnId: string | null;
  activeTurnMessage: Message | null;
  setActiveTurnId: (id: string | null) => void;
  setActiveTurnMessage: (message: Message | null) => void;
};

const ActiveTurnContext = createContext<ActiveTurnContextValue | undefined>(undefined);

export const ActiveTurnProvider = ({
  value,
  children,
}: {
  value: ActiveTurnContextValue;
  children: React.ReactNode;
}) => <ActiveTurnContext.Provider value={value}>{children}</ActiveTurnContext.Provider>;

export const useActiveTurn = () => {
  const ctx = useContext(ActiveTurnContext);
  if (!ctx) throw new Error("useActiveTurn must be used within ActiveTurnProvider");
  return ctx;
};

