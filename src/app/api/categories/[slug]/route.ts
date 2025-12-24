
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                products: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                isAcceptingOrders: true,
                                currentHotspot: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Fetch category error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
