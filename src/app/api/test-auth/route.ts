import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const { userId } = await auth();
    return NextResponse.json({ userId: userId || "NOT_SIGNED_IN" });
}
