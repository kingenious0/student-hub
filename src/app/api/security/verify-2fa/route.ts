import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@clerk/nextjs/server"
import speakeasy from "speakeasy"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { token } = await req.json()
    
    if (!token || token.length !== 6) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not setup for this user" },
        { status: 400 }
      )
    }
    
    // Decrypt secret
    const secret = Buffer.from(user.twoFactorSecret, "base64").toString()
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 2 // Allow 2 time steps before/after for clock drift
    })
    
    if (verified) {
      // Enable 2FA for user
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          has2FA: true,
          securitySetupComplete: true,
          lastSecurityCheck: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        verified: true,
        message: "2FA verified successfully"
      })
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: "Invalid code"
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
