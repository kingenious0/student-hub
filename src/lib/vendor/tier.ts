import { prisma } from '@/lib/db/prisma';

export type VendorTier = 'FOOD' | 'GOODS' | 'MIXED';

const FOOD_CATEGORY_SLUGS = ['food-and-snacks', 'food', 'snacks', 'beverages', 'cravings', 'drinks', 'meals'];

export async function getVendorTier(vendorId: string): Promise<VendorTier> {
  const categories = await prisma.product.findMany({
    where: { vendorId },
    select: {
      hasModifiers: true,
      category: { select: { slug: true } },
    },
  });

  if (categories.length === 0) return 'GOODS';

  let hasFood = false;
  let hasNonFood = false;

  for (const p of categories) {
    const isFood = p.hasModifiers || FOOD_CATEGORY_SLUGS.includes(p.category.slug);
    if (isFood) hasFood = true;
    else hasNonFood = true;
  }

  if (hasFood && hasNonFood) return 'MIXED';
  if (hasFood) return 'FOOD';
  return 'GOODS';
}
