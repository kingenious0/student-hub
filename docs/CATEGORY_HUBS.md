# 🏪 CATEGORY HUBS - Complete Implementation Guide

## Overview
**Category Hubs** are dedicated discovery pages for each product category on the OMNI Marketplace. Each hub provides advanced filtering, sorting, and category-specific features to help students find exactly what they need.

---

## 🎯 Available Category Hubs

### 1. **Food & Snacks** 🍕
- **URL**: `/category/food-and-snacks`
- **Special Filters**: Spicy Level (Mild, Medium, Hot, Fire)
- **Special Badges**: 🔥 Hot indicator for spicy items
- **Metadata**: Prep Time, Spicy Level

### 2. **Tech & Gadgets** 💻
- **URL**: `/category/tech-and-gadgets`
- **Special Filters**: Condition (New, Like New, Used, Refurbished)
- **Special Badges**: 🛡️ Escrow Verified
- **Metadata**: Condition, Model/Brand

### 3. **Books & Notes** 📚
- **URL**: `/category/books-and-notes`
- **Special Filters**: None (uses universal filters)
- **Metadata**: Course Code, Author/Edition

### 4. **Fashion** 👕
- **URL**: `/category/fashion`
- **Special Filters**: None (uses universal filters)
- **Metadata**: Size, Gender

### 5. **Services** ⚡
- **URL**: `/category/services`
- **Special Filters**: None (uses universal filters)
- **Metadata**: Service type, Duration

### 6. **Everything Else** 🎯
- **URL**: `/category/everything-else`
- **Special Filters**: None (uses universal filters)
- **Metadata**: Varies by item

---

## ✨ Universal Features (All Hubs)

### Hero Header
- **Large Category Icon**: Animated floating effect
- **Category Name**: Bold, uppercase, 7xl font
- **Description**: Contextual tagline for each category
- **Live Stats**: Real-time count of filtered/total items
- **Gradient Background**: Category-specific color theme
- **Back Button**: Returns to marketplace

### Filtering System
1. **Sort By**
   - Newest First (default)
   - Price: Low to High
   - Price: High to Low

2. **Location Filter**
   - Dynamically populated from product hotspots
   - Shows only hotspots with active listings

3. **Active Vendors Toggle**
   - Filter to show only vendors accepting orders
   - Green indicator for active status

### Active Filter Tags
- Visual pills showing applied filters
- One-click removal (× button)
- Color-coded by filter type:
  - 📍 Location: Primary color
  - 🌶️ Spicy: Red
  - 🛡️ Condition: Blue
  - ✓ Active: Green

### Product Cards
- **320px wide** with rounded corners
- **Product Image**: Hover zoom effect
- **Location Badge**: Top-left overlay
- **Vendor Status**: Bottom-right indicator (Live/Offline)
- **Category-Specific Badges**: Top-right (e.g., 🔥 SPICY, 🛡️ Escrow)
- **Metadata Display**: Shows relevant details (prep time, condition, course code)
- **Price Display**: Large, bold ₵ amount
- **View Button**: Hover effect changes to primary color

---

## 🎨 Design Specifications

### Color Themes by Category
```typescript
{
  'food-and-snacks': {
    gradient: 'from-orange-500/20 to-red-500/20',
    text: 'text-orange-500',
    icon: '🍕'
  },
  'tech-and-gadgets': {
    gradient: 'from-blue-500/20 to-cyan-500/20',
    text: 'text-cyan-500',
    icon: '💻'
  },
  'fashion': {
    gradient: 'from-pink-500/20 to-purple-500/20',
    text: 'text-pink-500',
    icon: '👕'
  },
  'books-and-notes': {
    gradient: 'from-amber-500/20 to-yellow-500/20',
    text: 'text-amber-500',
    icon: '📚'
  },
  'services': {
    gradient: 'from-yellow-500/20 to-orange-500/20',
    text: 'text-yellow-500',
    icon: '⚡'
  },
  'everything-else': {
    gradient: 'from-primary/20 to-primary/5',
    text: 'text-primary',
    icon: '🎯'
  }
}
```

### Responsive Breakpoints
- **Mobile** (< 768px): 1 column grid
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid

### Animations
- **Hero Icon**: Floating animation (3s loop)
- **Product Cards**: Fade-in with stagger (50ms delay per card)
- **Filter Changes**: Smooth opacity transition
- **Hover Effects**: Scale + shadow on product cards

---

## 🔧 API Endpoint

### GET `/api/categories/[slug]`

**Request**:
```
GET /api/categories/food-and-snacks
```

**Response**:
```json
{
  "success": true,
  "category": {
    "id": "cat_123",
    "name": "Food & Snacks",
    "slug": "food-and-snacks",
    "icon": "🍕",
    "description": "Satisfy your cravings with the best campus eats.",
    "products": [
      {
        "id": "prod_456",
        "title": "Indomie full package",
        "description": "Very delicious",
        "price": 70.00,
        "imageUrl": "https://...",
        "hotspot": "Pent Hostel",
        "createdAt": "2025-12-24T10:00:00Z",
        "details": {
          "prepTime": "5-10 mins",
          "spicyLevel": "Medium"
        },
        "vendor": {
          "id": "vendor_789",
          "name": "YAW BREW",
          "isAcceptingOrders": true,
          "currentHotspot": "Pent Hostel"
        }
      }
    ]
  }
}
```

---

## 🚀 User Experience Flow

### Discovery Path
1. User visits `/marketplace`
2. Scrolls to "Explore Categories" section
3. Clicks on a category card (e.g., "Food & Snacks 🍕")
4. Lands on category hub with all products
5. Uses filters to narrow down results
6. Clicks product card to view details

### Filtering Flow
1. **Initial Load**: Shows all products, sorted by newest
2. **Apply Filter**: User selects "Spicy Level: Hot"
3. **UI Updates**: 
   - Product grid filters instantly
   - Active filter tag appears: "🌶️ Hot"
   - Stats update: "2 of 5 items"
4. **Add More Filters**: User selects "Active Only"
5. **Refinement**: Grid shows only active vendors with hot items
6. **Clear Filters**: Click × on tags or "Clear All Filters" button

---

## 📊 Category-Specific Features

### Food & Snacks 🍕
**Spicy Level Filter**:
- Mild 🌶️
- Medium 🌶️🌶️
- Hot 🌶️🌶️🌶️
- Fire 🔥

**Displayed Metadata**:
- Prep Time (Instant, 5-10 mins, 15-20 mins, 30+ mins)
- Spicy Level badge on card

**Special Badges**:
- 🔥 SPICY (for Fire level items)

---

### Tech & Gadgets 💻
**Condition Filter**:
- ✨ New (Sealed)
- 📦 Like New (Open Box)
- 🔧 Used (Good)
- ♻️ Refurbished

**Displayed Metadata**:
- Condition
- Model/Brand

**Special Badges**:
- 🛡️ Escrow Verified (all tech items)

---

### Books & Notes 📚
**Displayed Metadata**:
- Course Code (e.g., MATH 123)
- Author/Edition

**Use Case**:
- Students search by course code
- Filter by hotspot to find nearby sellers
- Sort by price to find best deals

---

## 🐛 Troubleshooting

### Issue: Hub page stuck on "Loading Hub..."
**Cause**: Next.js dev server needs restart after code changes  
**Solution**: 
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Issue: Filters not working
**Possible Causes**:
1. JavaScript not hydrated - check browser console
2. State not updating - verify React hooks
3. API returning wrong data structure

**Debug Steps**:
1. Open browser console (F12)
2. Check for React errors
3. Verify API response at `/api/categories/[slug]`
4. Check network tab for failed requests

### Issue: Products not showing
**Possible Causes**:
1. No products in that category (expected behavior)
2. All products filtered out by active filters
3. API error

**Solution**:
1. Check "X of Y items" stat in hero header
2. Click "Clear All Filters" button
3. Verify products exist in database

---

## 🎓 Code Examples

### Adding a New Category-Specific Filter

**Example: Add "Size" filter for Fashion category**

```tsx
// In /src/app/category/[slug]/page.tsx

// 1. Add state
const [size, setSize] = useState<string>('');

// 2. Add to applyFilters function
if (slug === 'fashion' && size) {
    filtered = filtered.filter(p => p.details?.size === size);
}

// 3. Add UI in filters section
{slug === 'fashion' && (
    <div>
        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
            Size
        </label>
        <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl..."
        >
            <option value="">All Sizes</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            <option value="XL">Extra Large</option>
        </select>
    </div>
)}
```

---

### Customizing Hero Gradient

```tsx
// Modify getHeaderGradient() function
const getHeaderGradient = () => {
    switch (slug) {
        case 'food-and-snacks': 
            return { 
                bg: 'from-orange-500/30 to-red-500/30',  // Increase opacity
                text: 'text-orange-400',                  // Lighter shade
                icon: '🍕' 
            };
        // ... other cases
    }
};
```

---

## 📈 Success Metrics

Track these KPIs per category hub:
- **Page Views**: Total visits to hub
- **Filter Usage**: % of users who apply filters
- **Click-Through Rate**: % who click a product
- **Conversion Rate**: % who complete purchase
- **Average Time on Page**: Engagement metric
- **Bounce Rate**: % who leave without interaction

---

## 🔮 Future Enhancements

### Phase 2 Ideas
1. **Saved Searches**
   - Let users save filter combinations
   - "Your saved search has new items!"

2. **Price Alerts**
   - Notify when items drop below target price
   - "Indomie now ₵5 - Buy Now!"

3. **Comparison Tool**
   - Select multiple items to compare
   - Side-by-side specs for tech/books

4. **Vendor Profiles**
   - Click vendor name to see all their items
   - Vendor ratings and reviews

5. **Advanced Filters**
   - Price range slider (₵0 - ₵500)
   - Date range (last 7 days, last month)
   - Distance from user location

6. **AI Recommendations**
   - "Students like you also bought..."
   - "Trending in Food & Snacks this week"

---

## 🏆 Best Practices

### For Vendors
1. **Use High-Quality Images**: Products with images get 3x more clicks
2. **Fill All Details**: Complete metadata improves discoverability
3. **Update Hotspot**: Keep location current for better filtering
4. **Stay Active**: Toggle "Accepting Orders" when available

### For Buyers
1. **Use Filters**: Narrow down to exactly what you need
2. **Check Vendor Status**: Green dot = active, gray = offline
3. **Sort by Price**: Find best deals quickly
4. **Save Favorites**: (Coming soon) Bookmark items for later

---

## 📝 Testing Checklist

- [ ] Navigate to each category hub from marketplace
- [ ] Verify hero header displays correctly (icon, name, stats)
- [ ] Test "Sort By" dropdown (newest, price low-to-high, price high-to-low)
- [ ] Test location filter (select hotspot, verify products filter)
- [ ] Test "Active Only" toggle (verify only active vendors show)
- [ ] Test category-specific filters (spicy level, condition)
- [ ] Verify active filter tags appear and can be removed
- [ ] Test "Clear All Filters" button
- [ ] Verify empty state shows when no products match filters
- [ ] Test product card hover effects
- [ ] Click product card - verify navigation to product detail page
- [ ] Test responsive design on mobile, tablet, desktop
- [ ] Verify animations are smooth (hero icon float, card fade-in)
- [ ] Check browser console for errors

---

**Built with 🎯 by the OMNI Team**  
*Making campus commerce organized and efficient*
