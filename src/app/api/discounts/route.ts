
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface CartLine {
    id: string;
    productId?: string;
    quantity?: number;
    unitPriceCents?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lines: cartLines, subtotalCents } = body;

        if (!cartLines || !Array.isArray(cartLines)) {
            return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
        }

        const now = new Date();

        const discounts = await prisma.discountRule.findMany({
            where: {
                isActive: true,
                startsAt: { lte: now },
                OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
            orderBy: [{ isStackable: 'asc' }, { value: 'desc' }],
        });

        const applications: { discountId: string; name: string; amountCents: number; affectedLineIds: string[] }[] = [];
        let nonStackableApplied = false;

        for (const discount of discounts) {
            if (!discount.isStackable && nonStackableApplied) continue;

            if (discount.minCartAmount && (subtotalCents || 0) < discount.minCartAmount * 100) continue;

            const eligibleLines = cartLines.filter((line: CartLine) => {
                const productId = line.productId || line.id;
                if (discount.entitledProductIds.length > 0 && !discount.entitledProductIds.includes(productId)) return false;
                if (discount.excludedProductIds.length > 0 && discount.excludedProductIds.includes(productId)) return false;
                return true;
            });

            if (eligibleLines.length === 0) continue;

            let amountCents = 0;
            const affectedLineIds = eligibleLines.map((l: CartLine) => l.id);

            if (discount.type === 'PERCENTAGE') {
                amountCents = Math.round(
                    eligibleLines.reduce((s: number, l: CartLine) => s + (l.unitPriceCents || 0) * (l.quantity || 1), 0) * discount.value / 100
                );
            } else if (discount.type === 'FIXED_AMOUNT') {
                amountCents = Math.min(Math.round(discount.value * 100), subtotalCents || 0);
            } else if (discount.type === 'BOGO') {
                const buyQty = discount.minQuantity || 1;
                for (const line of eligibleLines) {
                    const qty = line.quantity || 1;
                    const unitPrice = line.unitPriceCents || 0;
                    const freeItems = Math.floor(qty / (buyQty + discount.value)) * discount.value;
                    amountCents += freeItems * unitPrice;
                }
            }

            if (amountCents > 0) {
                applications.push({
                    discountId: discount.id,
                    name: discount.name,
                    amountCents,
                    affectedLineIds,
                });
                if (!discount.isStackable) nonStackableApplied = true;
            }
        }

        const totalDiscountCents = applications.reduce((s, a) => s + a.amountCents, 0);

        return NextResponse.json({
            success: true,
            applications,
            totalDiscountCents,
            totalDiscountCedis: totalDiscountCents / 100,
        });
    } catch (error) {
        console.error('Discount evaluation error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
