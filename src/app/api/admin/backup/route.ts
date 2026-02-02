import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function GET() {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch Critical Data with Individual Error Handling
        const fetchData = async (fn: () => Promise<any>, label: string) => {
            try {
                return await fn();
            } catch (err) {
                console.error(`[BACKUP] Failed to fetch ${label}:`, err);
                return []; // Return empty array on failure for data tables
            }
        };

        const [users, products, orders, settings] = await Promise.all([
            fetchData(() => prisma.user.findMany(), 'users'),
            fetchData(() => prisma.product.findMany(), 'products'),
            fetchData(() => prisma.order.findMany(), 'orders'),
            fetchData(() => prisma.systemSettings.findUnique({ where: { id: 'GLOBAL_CONFIG' } }), 'settings')
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            system: "OMNI StudentHub",
            stats: {
                users: users?.length || 0,
                products: products?.length || 0,
                orders: orders?.length || 0
            },
            data: {
                config: settings,
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
        console.error('CRITICAL BACKUP FAILURE:', error);
        return NextResponse.json({ 
            error: 'Backup Generation Failed', 
            details: error instanceof Error ? error.message : 'Unknown Error' 
        }, { status: 500 });
    }
}
