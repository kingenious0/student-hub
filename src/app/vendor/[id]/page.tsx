import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import VendorStorefrontClient from './VendorStorefrontClient';

export const dynamic = 'force-dynamic';

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export default async function VendorStorefrontPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    let vendor = null;

    if (isUuid) {
        vendor = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                shopName: true,
                shopLandmark: true,
                phoneNumber: true,
                vendorStatus: true,
                vendorType: true,
                isAcceptingOrders: true,
                currentHotspot: true,
            }
        });
    } else {
        const activeVendors = await prisma.user.findMany({
            where: { vendorStatus: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                shopName: true,
                shopLandmark: true,
                phoneNumber: true,
                vendorStatus: true,
                vendorType: true,
                isAcceptingOrders: true,
                currentHotspot: true,
            }
        });
        vendor = activeVendors.find(v => v.shopName && slugify(v.shopName) === id.toLowerCase()) || null;
    }

    if (!vendor || vendor.vendorStatus !== 'ACTIVE') {
        notFound();
    }

    return <VendorStorefrontClient vendorData={vendor} />;
}

