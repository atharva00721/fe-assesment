import { NextResponse } from "next/server";

// Stub API endpoint - returns empty list for now
// In the future, this will fetch comments from localStorage or server based on the key
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key") || "";

        // TODO: Fetch comments from localStorage or server based on key
        return NextResponse.json([]);
    } catch (error) {
        console.error("Comments API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch comments", results: [] },
            { status: 500 }
        );
    }
}

