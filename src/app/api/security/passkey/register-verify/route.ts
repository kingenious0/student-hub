import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
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
    });

    if (!dbUser || !dbUser.currentChallenge) {
      return NextResponse.json({ error: "Invalid registration session" }, { status: 400 });
    }

    const rpID = req.nextUrl.hostname;
    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: dbUser.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      // Save the new passkey
      await prisma.authenticator.create({
        data: {
          userId: dbUser.id,
          credentialID: Buffer.from(credentialID).toString("base64url"),
          credentialPublicKey: Buffer.from(credentialPublicKey).toString("base64url"),
          counter: BigInt(counter),
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          transports: body.response.transports?.join(","),
        },
      });

      // Update user status
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { 
          hasPasskey: true,
          currentChallenge: null // Clear challenge
        },
      });

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Passkey Register Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
