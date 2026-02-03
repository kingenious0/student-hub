import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';

// Helper to convert JSON array to CSV string
function convertToCSV(data: any[]) {
    if (!data || data.length === 0) return 'No data found';
    
    // Extract headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const rows = data.map(obj => {
        return headers.map(header => {
            let val = obj[header];
            // Handle null/undef
            if (val === null || val === undefined) return '""';
            // Handle Dates
            if (val instanceof Date) return `"${val.toISOString()}"`;
            // Handle Objects/Arrays
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            // Handle Strings with quotes
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
}

export async function GET(request: NextRequest) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'orders'; // Default to orders for CSV
    const format = searchParams.get('format') || 'csv';

    try {
        let data: any[] = [];
        let filename = `omni_${table}_${new Date().toISOString().split('T')[0]}`;

        // Fetch based on requested table
        switch (table) {
            case 'users':
                data = await prisma.user.findMany();
                break;
            case 'products':
                data = await prisma.product.findMany({ include: { vendor: { select: { name: true } } } });
                break;
            case 'orders':
                data = await prisma.order.findMany({ include: { student: { select: { name: true, email: true } } } });
                break;
            case 'all':
                if (format === 'json') {
                    const [users, products, orders, settings] = await Promise.all([
                        prisma.user.findMany(),
                        prisma.product.findMany(),
                        prisma.order.findMany(),
                        prisma.systemSettings.findUnique({ where: { id: 'GLOBAL_CONFIG' } })
                    ]);
                    return NextResponse.json({ users, products, orders, settings });
                }
                return NextResponse.json({ error: 'CSV format not supported for "all" tables. Please select a specific table.' }, { status: 400 });
            default:
                return NextResponse.json({ error: 'Invalid table selection' }, { status: 400 });
        }

        if (format === 'csv') {
            const csvContent = convertToCSV(data);
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}.csv"`
                }
            });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('BACKUP EXPORT FAILURE:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
