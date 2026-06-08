import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code')?.trim().toUpperCase();
        const subtotalStr = searchParams.get('subtotal');

        if (!code) {
            return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
        }

        const subtotal = subtotalStr ? parseFloat(subtotalStr) : 0;

        // 1. Fetch Coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
        }

        // 2. Validate Coupon Status & Usage Limits
        if (!coupon.isActive) {
            return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 400 });
        }

        const now = new Date();
        if (now > coupon.expiryDate) {
            return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: 'This promo code has reached its maximum usage limit' }, { status: 400 });
        }

        // 3. Calculate Discount Amount
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = subtotal * (coupon.discountValue / 100);
        } else if (coupon.discountType === 'FIXED') {
            discount = Math.min(coupon.discountValue, subtotal); // Discount cannot exceed subtotal
        }

        return NextResponse.json({
            success: true,
            couponId: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: parseFloat(discount.toFixed(2))
        });

    } catch (error) {
        console.error('[ValidateCouponError]:', error);
        return NextResponse.json({ error: 'System Error validating coupon' }, { status: 500 });
    }
}
