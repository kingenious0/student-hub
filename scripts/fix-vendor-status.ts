// Quick script to check and fix vendor status
// Run this with: npx tsx scripts/fix-vendor-status.ts

import { prisma } from '../src/lib/db/prisma';

async function fixVendorStatus() {
    try {
        // Find all vendors with PENDING status
        const pendingVendors = await prisma.user.findMany({
            where: {
                role: 'VENDOR',
                vendorStatus: 'PENDING'
            },
            select: {
                id: true,
                email: true,
                name: true,
                shopName: true,
                vendorStatus: true
            }
        });

        console.log('\n📋 Found vendors with PENDING status:');
        console.log(pendingVendors);

        if (pendingVendors.length === 0) {
            console.log('\n✅ No pending vendors found!');

            // Check for ACTIVE vendors
            const activeVendors = await prisma.user.findMany({
                where: {
                    role: 'VENDOR',
                    vendorStatus: 'ACTIVE'
                },
                select: {
                    email: true,
                    shopName: true,
                    vendorStatus: true
                }
            });

            console.log('\n✅ Active vendors:');
            console.log(activeVendors);
            return;
        }

        // Auto-approve all pending vendors
        const result = await prisma.user.updateMany({
            where: {
                role: 'VENDOR',
                vendorStatus: 'PENDING'
            },
            data: {
                vendorStatus: 'ACTIVE'
            }
        });

        console.log(`\n✅ Updated ${result.count} vendor(s) to ACTIVE status!`);

        // Verify the update
        const nowActive = await prisma.user.findMany({
            where: {
                role: 'VENDOR',
                vendorStatus: 'ACTIVE'
            },
            select: {
                email: true,
                shopName: true,
                vendorStatus: true
            }
        });

        console.log('\n✅ Verified active vendors:');
        console.log(nowActive);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixVendorStatus();
