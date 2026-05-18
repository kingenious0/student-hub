import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
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

    if (!dbUser || dbUser.passkeys.length === 0) {
      return NextResponse.json({ error: "No passkeys registered" }, { status: 400 });
    }

    const rpID = req.nextUrl.hostname;

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: dbUser.passkeys.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
        transports: pk.transports?.split(",") as AuthenticatorTransport[],
      })),
      userVerification: "preferred",
    });

    // Store challenge for verification
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { currentChallenge: options.challenge },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey Auth Options Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
