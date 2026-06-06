import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import VendorStorefrontClient from './VendorStorefrontClient';

export const dynamic = 'force-dynamic';

export default async function VendorStorefrontPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const vendor = await prisma.user.findUnique({
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

    if (!vendor || vendor.vendorStatus !== 'ACTIVE') {
        notFound();
    }

    return <VendorStorefrontClient vendorData={vendor} />;
}
