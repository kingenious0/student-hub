import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { ghanaLocations } from '@/lib/data/ghana-locations'

// POST - Create a service listing
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, phoneNumber: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, price, priceLabel, contactPhone, contactWhatsApp, region, town, locationNote, images, category } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    if (!contactPhone?.trim()) {
      return NextResponse.json({ error: 'Contact phone is required' }, { status: 400 })
    }
    if (!region?.trim() || !town?.trim()) {
      return NextResponse.json({ error: 'Region and town are required' }, { status: 400 })
    }
    if (!category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const validRegion = ghanaLocations.find(
      l => l.region.toLowerCase() === region.toLowerCase()
    )
    if (!validRegion) {
      return NextResponse.json({ error: 'Invalid region' }, { status: 400 })
    }

    const service = await prisma.studentService.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: price ? Math.round(Number(price) * 100) / 100 : null,
        priceLabel: priceLabel || null,
        contactPhone: contactPhone.trim(),
        contactWhatsApp: contactWhatsApp?.trim() || null,
        region: validRegion.region,
        town: town.trim(),
        locationNote: locationNote?.trim() || null,
        images: images?.slice(0, 5) || [],
        category: category.trim(),
        userId: user.id,
      }
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - List services (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const town = searchParams.get('town')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {
      status: 'ACTIVE',
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }
    if (region) {
      where.region = { equals: region, mode: 'insensitive' }
    }
    if (town) {
      where.town = { equals: town, mode: 'insensitive' }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [services, total] = await Promise.all([
      prisma.studentService.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studentService.count({ where }),
    ])

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('List services error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
