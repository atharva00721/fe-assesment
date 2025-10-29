import { fetchServerQuestions } from "@/lib/questions";
import ChatClient from "./_components/chat-client";

export default async function ChatPage() {
  // Server-side data fetch (SSR static with revalidate)
  // Fetch ALL 1300+ Pokémon - fast because we only make 1 API call!
  const questions = await fetchServerQuestions(1300);

  return (
    <ChatClient initialQuestions={questions} />
  );
}
