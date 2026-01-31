import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@clerk/nextjs/server"
import speakeasy from "speakeasy"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Generate secret for TOTP
    const secret = speakeasy.generateSecret({
      name: `OMNI (${user.email})`,
      issuer: "OMNI Student Hub"
    })
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    )
    
    // Encrypt secret and backup codes (in production, use proper encryption)
    const encryptedSecret = Buffer.from(secret.base32).toString("base64")
    const encryptedBackupCodes = backupCodes.map(code =>
      Buffer.from(code).toString("base64")
    )
    
    // Store encrypted secret temporarily (will be confirmed after verification)
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        twoFactorSecret: encryptedSecret,
        mfaBackupCodes: encryptedBackupCodes
      }
    })
    
    return NextResponse.json({
      success: true,
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      backupCodes: backupCodes
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    )
  }
}
