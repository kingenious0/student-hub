import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { pin, clerkId } = await req.json();

    if (!pin || !clerkId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Hash the PIN for "90 strong" security
    const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

    await prisma.user.update({
      where: { clerkId },
      data: {
        // Since we don't have a 'pin' field in User, we'll store it in a new field or reuse metadata
        // For now, I'll assume we add a 'securityPin' field to User model
        securityPin: hashedPin,
        hasBiometric: false, // Override face recognition if user chooses PIN
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save PIN Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
