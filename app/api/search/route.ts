import { fetchServerQuestions } from "@/lib/questions";
import { NextResponse } from "next/server";

// Simple fuzzy search function (same logic as client)
function searchQuestions(query: string, questions: Array<{ question: string }>): Array<{ question: string }> {
  if (!query.trim()) {
    return questions.slice(0, 5).map(q => ({ question: q.question }));
  }

  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  // Score each question based on matches
  const scored = questions.map(qa => {
    const lowerQuestion = qa.question.toLowerCase();
    let score = 0;

    // Exact match bonus
    if (lowerQuestion === lowerQuery) {
      score += 100;
    }

    // Contains full query
    if (lowerQuestion.includes(lowerQuery)) {
      score += 50;
    }

    // Word matches
    queryWords.forEach(word => {
      if (lowerQuestion.includes(word)) {
        score += 10;
      }
    });

    // Start of question bonus
    if (lowerQuestion.startsWith(lowerQuery)) {
      score += 25;
    }

    return { qa, score };
  });

  // Filter and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => ({ question: item.qa.question }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // Fetch questions from server (uses Next.js cache)
    const questions = await fetchServerQuestions(1300);

    // Perform search
    const results = searchQuestions(query, questions);

    return NextResponse.json({ results: results.map(r => r.question) });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search questions", results: [] },
      { status: 500 }
    );
  }
}
