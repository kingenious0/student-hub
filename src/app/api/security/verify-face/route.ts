import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { faceDescriptor } = await req.json()
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: "Invalid face descriptor" },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    
    if (!user || !user.faceDescriptor) {
      return NextResponse.json(
        { error: "No biometric data found" },
        { status: 404 }
      )
    }
    
    // Calculate Euclidean distance between face descriptors
    const storedDescriptor = user.faceDescriptor as number[]
    const distance = euclideanDistance(storedDescriptor, faceDescriptor)
    
    // Threshold for face matching (typically 0.6 or lower is considered a match)
    const threshold = 0.6
    const isMatch = distance < threshold
    
    if (isMatch) {
      // Update last security check
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          lastSecurityCheck: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        verified: true,
        confidence: 1 - distance,
        message: "Face verification successful"
      })
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: "Face verification failed"
      }, { status: 403 })
    }
  } catch (error) {
    console.error("Error verifying face:", error)
    return NextResponse.json(
      { error: "Face verification failed" },
      { status: 500 }
    )
  }
}

function euclideanDistance(arr1: number[], arr2: number[]): number {
  if (arr1.length !== arr2.length) {
    throw new Error("Arrays must have the same length")
  }
  
  let sum = 0
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2)
  }
  
  return Math.sqrt(sum)
}
