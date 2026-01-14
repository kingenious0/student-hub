import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function GET() {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch Critical Data
        const [users, products, orders, config] = await Promise.all([
            prisma.user.findMany(),
            prisma.product.findMany(),
            prisma.order.findMany(),
            prisma.systemConfig.findUnique({ where: { id: 'GLOBAL_CONFIG' } })
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            system: "OMNI StudentHub",
            stats: {
                users: users.length,
                products: products.length,
                orders: orders.length
            },
            data: {
                config,
                users,
                products,
                orders
            }
        };

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="omni_backup_${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Backup Generation Failed' }, { status: 500 });
    }
}
