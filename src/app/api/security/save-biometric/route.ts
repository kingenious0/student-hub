import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { faceDescriptor, clerkId } = await req.json()
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: "Invalid face descriptor" },
        { status: 400 }
      )
    }
    
    // Update user with biometric data
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        hasBiometric: true,
        faceDescriptor: faceDescriptor,
        lastSecurityCheck: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "Biometric data saved successfully"
    })
  } catch (error) {
    console.error("Error saving biometric data:", error)
    return NextResponse.json(
      { error: "Failed to save biometric data" },
      { status: 500 }
    )
  }
}
