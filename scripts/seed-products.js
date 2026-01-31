const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productTemplates = {
  food: [
    { title: 'Jollof Rice & Chicken', desc: 'Spicy Ghanaian jollof rice with grilled chicken', price: 25, spicyLevel: 'medium' },
    { title: 'Banku & Tilapia', desc: 'Fresh tilapia with hot pepper and banku', price: 30, spicyLevel: 'hot' },
    { title: 'Waakye Special', desc: 'Complete waakye with all the sides', price: 20, spicyLevel: 'mild' },
    { title: 'Fried Rice Bowl', desc: 'Tasty fried rice with mixed vegetables', price: 18, spicyLevel: 'mild' },
    { title: 'Kelewele & Groundnuts', desc: 'Spicy fried plantain with roasted peanuts', price: 10, spicyLevel: 'hot' },
    { title: 'Meat Pie', desc: 'Freshly baked meat pie', price: 5, spicyLevel: 'none' },
    { title: 'Pizza Slice', desc: 'Hot cheesy pizza slice', price: 15, spicyLevel: 'mild' },
    { title: 'Burger & Fries', desc: 'Juicy beef burger with crispy fries', price: 28, spicyLevel: 'mild' },
    { title: 'Shawarma', desc: 'Chicken shawarma wrap', price: 20, spicyLevel: 'medium' },
    { title: 'Spring Rolls (6pc)', desc: 'Crispy vegetable spring rolls', price: 12, spicyLevel: 'none' },
  ],
  tech: [
    { title: 'USB-C Cable', desc: 'Fast charging USB-C cable 1.5m', price: 35, condition: 'new' },
    { title: 'Wireless Mouse', desc: 'Bluetooth wireless mouse for laptop', price: 55, condition: 'new' },
    { title: 'Power Bank 20000mAh', desc: 'High capacity portable charger', price: 120, condition: 'new' },
    { title: 'Laptop Charger', desc: 'Universal laptop charger 65W', price: 90, condition: 'new' },
    { title: 'Phone Case', desc: 'Protective silicone phone case', price: 25, condition: 'new' },
    { title: 'Bluetooth Earbuds', desc: 'True wireless earbuds with case', price: 85, condition: 'new' },
    { title: 'USB Flash Drive 32GB', desc: 'High speed USB 3.0 flash drive', price: 40, condition: 'new' },
    { title: 'HDMI Cable', desc: '2m HDMI cable for display connection', price: 30, condition: 'new' },
    { title: 'Laptop Stand', desc: 'Ergonomic aluminum laptop stand', price: 75, condition: 'new' },
    { title: 'Screen Protector', desc: 'Tempered glass screen protector', price: 20, condition: 'new' },
  ],
  fashion: [
    { title: 'Graphic T-Shirt', desc: 'Cool printed graphic tee', price: 45, condition: 'new', size: 'M' },
    { title: 'Denim Jeans', desc: 'Classic fit blue jeans', price: 80, condition: 'new', size: 'L' },
    { title: 'Sneakers', desc: 'Comfortable canvas sneakers', price: 120, condition: 'new', size: '42' },
    { title: 'Backpack', desc: 'Stylish student backpack', price: 95, condition: 'new' },
    { title: 'Baseball Cap', desc: 'Adjustable sports cap', price: 30, condition: 'new' },
    { title: 'Sunglasses', desc: 'UV protection sunglasses', price: 40, condition: 'new' },
    { title: 'Watch', desc: 'Digital sports watch', price: 65, condition: 'new' },
    { title: 'Belt', desc: 'Leather belt black', price: 35, condition: 'new' },
    { title: 'Socks Pack (5)', desc: 'Cotton socks multi-color', price: 25, condition: 'new' },
    { title: 'Hoodie', desc: 'Warm pullover hoodie', price: 90, condition: 'new', size: 'L' },
  ],
  books: [
    { title: 'Engineering Mathematics Notes', desc: 'Complete semester notes', price: 20, condition: 'used' },
    { title: 'Chemistry Lab Manual', desc: 'Comprehensive lab guide', price: 25, condition: 'new' },
    { title: 'Physics Textbook', desc: 'University physics edition', price: 55, condition: 'used' },
    { title: 'Programming Guide', desc: 'Python programming handbook', price: 40, condition: 'new' },
    { title: 'Economics Textbook', desc: 'Principles of Economics', price: 50, condition: 'used' },
    { title: 'Biology Notes Bundle', desc: 'All semester notes', price: 30, condition: 'used' },
    { title: 'Study Planner', desc: 'Academic year planner', price: 15, condition: 'new' },
    { title: 'Calculator Scientific', desc: 'Casio scientific calculator', price: 70, condition: 'new' },
    { title: 'Notebook A4 (5 pack)', desc: 'Ruled notebooks', price: 20, condition: 'new' },
    { title: 'Past Questions Booklet', desc: '5 years past questions', price: 18, condition: 'new' },
  ],
  services: [
    { title: 'Laundry Service', desc: 'Wash, iron and fold your clothes', price: 40 },
    { title: 'Haircut', desc: 'Professional student haircut', price: 15 },
    { title: 'Phone Repair', desc: 'Screen replacement and repairs', price: 80 },
    { title: 'Laptop Repair', desc: 'Hardware and software fixes', price: 100 },
    { title: 'Typing Service', desc: 'Document typing per page', price: 5 },
    { title: 'Tutoring - Math', desc: '1 hour math tutoring session', price: 30 },
    { title: 'Photography', desc: 'Event photography service', price: 120 },
    { title: 'Graphic Design', desc: 'Logo and poster design', price: 60 },
    { title: 'Resume Writing', desc: 'Professional CV writing', price: 50 },
    { title: 'Assignment Help', desc: 'Academic writing assistance', price: 70 },
  ],
  beauty: [
    { title: 'Skincare Set', desc: 'Complete face care routine', price: 85, condition: 'new' },
    { title: 'Hair Cream', desc: 'Moisturizing hair cream', price: 35, condition: 'new' },
    { title: 'Body Lotion', desc: 'Coconut scented body lotion', price: 30, condition: 'new' },
    { title: 'Lip Gloss', desc: 'Shiny lip gloss', price: 20, condition: 'new' },
    { title: 'Nail Polish Set', desc: '5 colors nail polish', price: 40, condition: 'new' },
    { title: 'Perfume', desc: 'Long lasting fragrance', price: 65, condition: 'new' },
    { title: 'Face Mask (10pc)', desc: 'Hydrating sheet masks', price: 45, condition: 'new' },
    { title: 'Hair Brush', desc: 'Detangling hair brush', price: 25, condition: 'new' },
    { title: 'Makeup Remover', desc: 'Gentle makeup remover wipes', price: 18, condition: 'new' },
    { title: 'Shampoo & Conditioner', desc: 'Hair care bundle', price: 55, condition: 'new' },
  ],
  sports: [
    { title: 'Football', desc: 'Official size 5 football', price: 60, condition: 'new' },
    { title: 'Basketball', desc: 'Indoor/outdoor basketball', price: 70, condition: 'new' },
    { title: 'Yoga Mat', desc: 'Non-slip exercise mat', price: 45, condition: 'new' },
    { title: 'Dumbbells 5kg Pair', desc: 'Weight training dumbbells', price: 80, condition: 'new' },
    { title: 'Resistance Bands', desc: 'Set of 3 resistance bands', price: 35, condition: 'new' },
    { title: 'Jump Rope', desc: 'Speed jump rope', price: 20, condition: 'new' },
    { title: 'Sports Bottle', desc: '1L water bottle', price: 25, condition: 'new' },
    { title: 'Running Shoes', desc: 'Comfortable running shoes', price: 140, condition: 'new', size: '42' },
    { title: 'Sports Shorts', desc: 'Athletic training shorts', price: 40, condition: 'new', size: 'M' },
    { title: 'Gym Towel', desc: 'Quick-dry sports towel', price: 18, condition: 'new' },
  ],
  other: [
    { title: 'Room Decoration', desc: 'LED strip lights 5m', price: 55, condition: 'new' },
    { title: 'Desk Lamp', desc: 'USB powered LED lamp', price: 40, condition: 'new' },
    { title: 'Wall Clock', desc: 'Modern wall clock', price: 45, condition: 'new' },
    { title: 'Bluetooth Speaker', desc: 'Portable wireless speaker', price: 95, condition: 'new' },
    { title: 'Extension Cable', desc: '4-socket extension cord', price: 35, condition: 'new' },
    { title: 'Hangers (10pc)', desc: 'Plastic clothes hangers', price: 15, condition: 'new' },
    { title: 'Trash Bin', desc: 'Small waste basket', price: 20, condition: 'new' },
    { title: 'Laundry Basket', desc: 'Collapsible laundry hamper', price: 30, condition: 'new' },
    { title: 'Door Mat', desc: 'Welcome door mat', price: 25, condition: 'new' },
    { title: 'Bedsheets Set', desc: 'Queen size bedding set', price: 85, condition: 'new' },
  ],
};

const hotspots = [
  'Balme Library', 'Night Market', 'Pent Hostel', 'Bush Canteen', 
  'Main Gate', 'Commonwealth Hall', 'Legon Hall', 'Mensah Sarbah Hall',
  'ISH', 'Evandy Hostel', 'Pentagon Hostel', 'KNUST Main Gate'
];

const images = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944',
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting to seed 50 products...\n');

  // Get all categories
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('❌ No categories found. Please seed categories first.');
    return;
  }

  // Get all vendors
  const vendors = await prisma.user.findMany({
    where: { role: { in: ['VENDOR', 'ADMIN', 'GOD_MODE'] } }
  });

  if (vendors.length === 0) {
    console.error('❌ No vendors found. Creating a default vendor...');
    
    // Create a default vendor
    const defaultVendor = await prisma.user.create({
      data: {
        clerkId: 'seed_vendor_' + Date.now(),
        email: 'vendor@omni.test',
        name: 'Campus Store',
        role: 'VENDOR',
        shopName: 'Campus Store',
        shopLandmark: 'Main Campus',
        vendorStatus: 'ACTIVE',
        phoneNumber: '0241234567',
        onboarded: true,
      }
    });
    
    vendors.push(defaultVendor);
    console.log('✅ Created default vendor\n');
  }

  let productsCreated = 0;
  const targetCount = 50;

  while (productsCreated < targetCount) {
    const category = randomChoice(categories);
    const categorySlug = category.slug.replace(/-/g, '_').split('_')[0]; // Get first word
    
    let templates = [];
    
    // Match category to templates
    if (categorySlug === 'food') templates = productTemplates.food;
    else if (categorySlug === 'tech') templates = productTemplates.tech;
    else if (categorySlug === 'fashion') templates = productTemplates.fashion;
    else if (categorySlug === 'books') templates = productTemplates.books;
    else if (categorySlug === 'services') templates = productTemplates.services;
    else if (categorySlug === 'beauty') templates = productTemplates.beauty;
    else if (categorySlug === 'sports') templates = productTemplates.sports;
    else templates = productTemplates.other;

    const template = randomChoice(templates);
    const vendor = randomChoice(vendors);

    try {
      const product = await prisma.product.create({
        data: {
          title: template.title,
          description: template.desc,
          price: template.price,
          categoryId: category.id,
          vendorId: vendor.id,
          hotspot: randomChoice(hotspots),
          imageUrl: randomChoice(images),
          stockQuantity: randomInt(5, 50),
          lowStockThreshold: 5,
          isInStock: true,
          viewCount: randomInt(0, 100),
          salesCount: randomInt(0, 20),
          averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
          totalReviews: randomInt(0, 15),
          details: template.spicyLevel ? { spicyLevel: template.spicyLevel, condition: template.condition } :
                   template.condition ? { condition: template.condition, size: template.size } :
                   template.size ? { size: template.size } : null,
        },
      });

      productsCreated++;
      console.log(`✅ [${productsCreated}/${targetCount}] Created: ${product.title} (${category.name})`);
    } catch (error) {
      console.error(`❌ Error creating product:`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${productsCreated} products!`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
