import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { passkeys: true },
    });

    if (!dbUser || !dbUser.currentChallenge) {
      return NextResponse.json({ error: "Invalid authentication session" }, { status: 400 });
    }

    const passkey = dbUser.passkeys.find((pk) => pk.credentialID === body.id);
    if (!passkey) {
      return NextResponse.json({ error: "Credential not found" }, { status: 400 });
    }

    const rpID = req.nextUrl.hostname;
    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: dbUser.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: passkey.credentialID,
        credentialPublicKey: Buffer.from(passkey.credentialPublicKey, "base64url"),
        counter: Number(passkey.counter),
      },
    });

    if (verification.verified) {
      const { newCounter } = verification.authenticationInfo;

      // Update counter and clear challenge
      await prisma.authenticator.update({
        where: { id: passkey.id },
        data: { counter: BigInt(newCounter) },
      });

      await prisma.user.update({
        where: { id: dbUser.id },
        data: { currentChallenge: null },
      });

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
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Passkey Auth Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
