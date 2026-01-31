/**
 * Advanced Search & Filter Engine
 * - Efficient product searching
 * - Multi-field filtering
 * - Smart sorting
 * - Ranking algorithms
 */

export interface SearchQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
  page?: number;
  pageSize?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Calculate search relevance score
 * Higher score = more relevant
 */
export function calculateRelevance(
  query: string,
  title: string,
  description: string,
  category: string
): number {
  const q = query.toLowerCase();
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  const c = category.toLowerCase();

  let score = 0;

  // Exact match: 100 points
  if (t === q) score += 100;

  // Title contains query: 50 points
  if (t.includes(q)) score += 50;

  // Description contains query: 20 points
  if (d.includes(q)) score += 20;

  // Category match: 10 points
  if (c.includes(q)) score += 10;

  // Word match in title: 30 points per word
  const queryWords = q.split(' ');
  const titleWords = t.split(' ');
  queryWords.forEach(word => {
    if (titleWords.includes(word)) score += 30;
  });

  return score;
}

/**
 * Apply sorting to products
 */
export function applySorting<T extends { price?: number; createdAt?: string | Date; rating?: number; salesCount?: number }>(
  items: T[],
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating' = 'relevance'
): T[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

    case 'price-desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    case 'popular':
      return sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));

    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    default:
      return sorted;
  }
}

/**
 * Apply filters to products
 */
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  filters: Record<string, any>
): T[] {
  return items.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue;

      if (key === 'minPrice' && (item.price || 0) < value) return false;
      if (key === 'maxPrice' && (item.price || 0) > value) return false;
      if (key === 'category' && item.categoryId !== value) return false;
      if (key === 'inStock' && value === true && !item.isInStock) return false;

      // Custom filter
      if (typeof value === 'object' && !Array.isArray(value)) continue;
      if (item[key] !== value) return false;
    }
    return true;
  });
}

/**
 * Paginate results
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20
): SearchResult<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    hasMore: end < items.length,
  };
}

/**
 * Search products with all filters and sorting
 */
export function searchProducts<
  T extends { price?: number; createdAt?: string | Date; rating?: number; salesCount?: number; title?: string; description?: string; categoryId?: string }
>(items: T[], query: SearchQuery): SearchResult<T> {
  let results = [...items];

  // Apply text search
  if (query.q) {
    results = results
      .map(item => ({
        item,
        score: calculateRelevance(
          query.q || '',
          item.title || '',
          item.description || '',
          item.categoryId || ''
        ),
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);
  }

  // Apply filters
  const filters: Record<string, any> = {};
  if (query.minPrice !== undefined) filters.minPrice = query.minPrice;
  if (query.maxPrice !== undefined) filters.maxPrice = query.maxPrice;
  if (query.category) filters.category = query.category;

  results = applyFilters(results, filters);

  // Apply sorting
  results = applySorting(results, query.sortBy);

  // Apply pagination
  return paginate(results, query.page, query.pageSize);
}

/**
 * Get facets (filter options with counts)
 */
export function getFacets<T extends { categoryId?: string; price?: number }>(
  items: T[],
  facetFields: string[] = ['categoryId']
): Record<string, Record<string, number>> {
  const facets: Record<string, Record<string, number>> = {};

  facetFields.forEach(field => {
    facets[field] = {};
    items.forEach(item => {
      const value = (item as any)[field];
      if (value) {
        facets[field][value] = (facets[field][value] || 0) + 1;
      }
    });
  });

  return facets;
}
