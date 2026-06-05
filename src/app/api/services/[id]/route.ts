import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

// GET - Single service detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const service = await prisma.studentService.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Increment view count (fire & forget)
    prisma.studentService.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a service listing
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = await prisma.studentService.findFirst({
      where: { id, userId: user.id }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, price, priceLabel, contactPhone, contactWhatsApp, region, town, locationNote, images, category, status } = body

    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (description !== undefined) data.description = description.trim()
    if (price !== undefined) data.price = price !== null ? Math.round(Number(price) * 100) / 100 : null
    if (priceLabel !== undefined) data.priceLabel = priceLabel
    if (contactPhone !== undefined) data.contactPhone = contactPhone.trim()
    if (contactWhatsApp !== undefined) data.contactWhatsApp = contactWhatsApp?.trim() || null
    if (region !== undefined) data.region = region
    if (town !== undefined) data.town = town.trim()
    if (locationNote !== undefined) data.locationNote = locationNote?.trim() || null
    if (images !== undefined) data.images = images.slice(0, 5)
    if (category !== undefined) data.category = category.trim()
    if (status !== undefined) data.status = status

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await prisma.studentService.update({
      where: { id },
      data,
    })

    return NextResponse.json({ service: updated })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a service listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = await prisma.studentService.findFirst({
      where: { id, userId: user.id }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await prisma.studentService.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
