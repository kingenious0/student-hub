import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // 1. Dual-Layer Auth Check (God Key OR God Mode Role)
        const adminKey = req.headers.get('x-admin-key');
        const { sessionClaims } = await auth();
        const userRole = (sessionClaims?.metadata as any)?.role;

        const isAuthorized =
            adminKey === 'omniadmin.com' ||
            userRole === 'GOD_MODE';

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
        }

        // 2. Delete related records first (cascade)
        console.log(`[ADMIN-DELETE] Deleting product ${id} and related records...`);

        // Delete in order: dependents first, then the product
        await prisma.$transaction(async (tx) => {
            // Delete order items that reference this product
            await tx.orderItem.deleteMany({
                where: { productId: id }
            });

            // Delete cart items
            await tx.cartItem.deleteMany({
                where: { productId: id }
            });

            // Finally, delete the product
            await tx.product.delete({
                where: { id }
            });
        });

        console.log(`[ADMIN-DELETE] Product ${id} TERMINATED`);

        return NextResponse.json({ success: true, message: 'ASSET TERMINATED' });

    } catch (error: any) {
        console.error('[ADMIN-DELETE] Error:', error);

        // Provide more detailed error messages
        let errorMessage = 'DELETION FAILED';
        if (error.code === 'P2025') {
            errorMessage = 'Product not found';
        } else if (error.code === 'P2003') {
            errorMessage = 'Cannot delete - product has dependent records';
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            details: error.message
        }, { status: 500 });
    }
}
