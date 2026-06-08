import { prisma } from '@/lib/db/prisma';

export type VendorTier = 'FOOD' | 'GOODS' | 'MIXED';

const FOOD_CATEGORY_SLUGS = ['food-and-snacks', 'food', 'snacks', 'beverages', 'cravings', 'drinks', 'meals'];

function computeVendorTier(products: Array<{ hasModifiers: boolean; category: { slug: string } }>): VendorTier {
  if (products.length === 0) return 'GOODS';

  let hasFood = false;
  let hasNonFood = false;

  for (const p of products) {
    const isFood = p.hasModifiers || FOOD_CATEGORY_SLUGS.includes(p.category.slug);
    if (isFood) hasFood = true;
    else hasNonFood = true;
  }

  if (hasFood && hasNonFood) return 'MIXED';
  if (hasFood) return 'FOOD';
  return 'GOODS';
}

export async function getVendorTier(vendorId: string): Promise<VendorTier> {
  // Try stored field first
  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    select: { vendorType: true },
  });

  if (user?.vendorType) {
    return user.vendorType as VendorTier;
  }

  // Fall back to computation and persist for future
  const products = await prisma.product.findMany({
    where: { vendorId },
    select: {
      hasModifiers: true,
      category: { select: { slug: true } },
    },
  });

  const tier = computeVendorTier(products);

  // Persist for next time
  await prisma.user.update({
    where: { id: vendorId },
    data: { vendorType: tier },
  });

  return tier;
}
