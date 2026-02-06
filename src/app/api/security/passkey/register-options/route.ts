import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { passkeys: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rpName = "Omni Student Marketplace";
    const rpID = req.nextUrl.hostname; // e.g., "localhost" or "omni.ac"
    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: dbUser.id,
      userName: dbUser.email,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
        authenticatorAttachment: "platform", // Strong preference for fingerprint/faceid on device
      },
      excludeCredentials: dbUser.passkeys.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
      })),
    });

    // Store challenge for verification
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { currentChallenge: options.challenge },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey Register Options Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
