import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        {
            message:
                "Comments are persisted in browser localStorage on the client. No server storage implemented yet.",
        },
        { status: 501 }
    );
}

export async function POST() {
    return NextResponse.json(
        {
            message:
                "Comments are client-side only for this assignment. Stub API.",
        },
        { status: 501 }
    );
}

