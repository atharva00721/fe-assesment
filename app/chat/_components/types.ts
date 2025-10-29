export type ConversationMode = "Auto" | "Agent" | "Manual";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

