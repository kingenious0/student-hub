import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    console.log('[DEBUG] Security Status Check - UserId:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        has2FA: true,
        hasBiometric: true,
        hasPasskey: true,
        securityPin: true,
        securitySetupComplete: true,
        lastSecurityCheck: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Check if security setup needs renewal (every 30 days)
    const daysSinceCheck = user.lastSecurityCheck
      ? Math.floor((Date.now() - new Date(user.lastSecurityCheck).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    return NextResponse.json({
      ...user,
      needsVerification: daysSinceCheck > 30,
      daysSinceCheck
    })
  } catch (error) {
    console.error("Error checking security status:", error)
    return NextResponse.json(
      { error: "Failed to check security status" },
      { status: 500 }
    )
  }
}
