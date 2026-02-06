import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pin } = await req.json();
    if (!pin) {
      return NextResponse.json({ error: "PIN required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser || !dbUser.securityPin) {
      return NextResponse.json({ error: "No PIN setup" }, { status: 400 });
    }

    const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

    if (hashedPin === dbUser.securityPin) {
      // Set verification cookie
      const response = NextResponse.json({ verified: true });
      response.cookies.set("OMNI_IDENTITY_VERIFIED", "TRUE", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verify PIN Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
