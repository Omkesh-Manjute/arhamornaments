import { Product, Banner, Category } from '../types';

export const products: Product[] = [
  // Rings
  {
    id: '1',
    name: 'Eternal Diamond Ring',
    designNo: 'DR-001-PLAT',
    grossWeight: 4.520,
    netWeight: 4.200,
    laborCharges: 15,
    size: '12',
    price: 45999,
    originalPrice: 52999,
    category: 'rings',
    material: 'diamond',
    occasion: 'bridal',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500'
    ],
    description: 'Stunning diamond ring perfect for engagements and special occasions. Crafted with 18K gold and certified diamonds.',
    inStock: true,
    featured: true,
    trending: true,
    rating: 4.9,
    reviews: 156
  },
  {
    id: '2',
    name: 'Classic Gold Band',
    designNo: 'GB-102-22K',
    grossWeight: 5.800,
    netWeight: 5.800,
    laborCharges: 8,
    size: '14',
    price: 25999,
    category: 'rings',
    material: 'gold',
    occasion: 'daily',
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500'
    ],
    description: 'Timeless 22K gold band ring, perfect for everyday elegance.',
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 89
  },
  {
    id: '3',
    name: 'Rose Gold Promise Ring',
    designNo: 'RGR-003-18K',
    grossWeight: 2.850,
    netWeight: 2.600,
    laborCharges: 12,
    price: 18999,
    originalPrice: 21999,
    category: 'rings',
    material: 'gold',
    occasion: 'gift',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'
    ],
    description: 'Beautiful rose gold ring with delicate design, perfect as a promise or anniversary gift.',
    inStock: true,
    trending: true,
    rating: 4.8,
    reviews: 67
  },
  // Necklaces
  {
    id: '4',
    name: 'Royal Bridal Necklace Set',
    designNo: 'BNS-401-22K',
    grossWeight: 45.200,
    netWeight: 42.500,
    laborCharges: 18,
    price: 125999,
    originalPrice: 145999,
    category: 'necklaces',
    material: 'gold',
    occasion: 'bridal',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500'
    ],
    description: 'Magnificent bridal necklace set with matching earrings. Features intricate traditional design with gold polish.',
    inStock: true,
    featured: true,
    trending: true,
    rating: 4.9,
    reviews: 234
  },
  {
    id: '5',
    name: 'Pearl Elegance Necklace',
    designNo: 'PN-502-GOLD',
    grossWeight: 12.800,
    netWeight: 8.200,
    laborCharges: 10,
    price: 35999,
    category: 'necklaces',
    material: 'gold',
    occasion: 'party',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'
    ],
    description: 'Elegant pearl necklace with gold chain, perfect for parties and special occasions.',
    inStock: true,
    featured: true,
    rating: 4.6,
    reviews: 112
  },
  {
    id: '6',
    name: 'Diamond Pendant Necklace',
    designNo: 'DPN-603-18K',
    grossWeight: 6.500,
    netWeight: 5.800,
    laborCharges: 15,
    price: 55999,
    originalPrice: 62999,
    category: 'necklaces',
    material: 'diamond',
    occasion: 'gift',
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500'
    ],
    description: 'Stunning diamond pendant on 18K gold chain. Perfect gift for someone special.',
    inStock: true,
    trending: true,
    rating: 4.8,
    reviews: 178
  },
  // Earrings
  {
    id: '7',
    name: 'Jhumka Gold Earrings',
    designNo: 'JKE-701-22K',
    grossWeight: 15.600,
    netWeight: 15.600,
    laborCharges: 12,
    price: 28999,
    category: 'earrings',
    material: 'gold',
    occasion: 'bridal',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'
    ],
    description: 'Traditional gold jhumka earrings with intricate design. Perfect for weddings and festivals.',
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 203
  },
  {
    id: '8',
    name: 'Diamond Stud Earrings',
    designNo: 'DSE-802-WGLD',
    grossWeight: 3.200,
    netWeight: 2.800,
    laborCharges: 20,
    price: 39999,
    originalPrice: 45999,
    category: 'earrings',
    material: 'diamond',
    occasion: 'daily',
    images: [
      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500'
    ],
    description: 'Classic diamond studs perfect for everyday wear. Set in 14K white gold.',
    inStock: true,
    trending: true,
    rating: 4.9,
    reviews: 145
  },
  {
    id: '9',
    name: 'Silver Drop Earrings',
    designNo: 'SDE-903-SILV',
    grossWeight: 8.500,
    netWeight: 8.500,
    laborCharges: 5,
    price: 8999,
    category: 'earrings',
    material: 'silver',
    occasion: 'party',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500'
    ],
    description: 'Elegant silver drop earrings with modern design. Perfect for parties and casual outings.',
    inStock: true,
    rating: 4.5,
    reviews: 67
  },
  // Coins
  {
    id: '10',
    name: 'Gold Coin 10gm - Lakshmi',
    designNo: 'GCN-1001-24K',
    grossWeight: 10.000,
    netWeight: 10.000,
    laborCharges: 3,
    price: 72999,
    category: 'coins',
    material: 'gold',
    occasion: 'gift',
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=500'
    ],
    description: '24K pure gold coin with Lakshmi design. Perfect for festivals and auspicious occasions.',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 312
  },
  {
    id: '11',
    name: 'Gold Coin 5gm - Ganesh',
    designNo: 'GCN-1102-24K',
    grossWeight: 5.000,
    netWeight: 5.000,
    laborCharges: 3,
    price: 36999,
    category: 'coins',
    material: 'gold',
    occasion: 'gift',
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=500'
    ],
    description: '24K pure gold coin with Ganesh design. Ideal for gifting on religious occasions.',
    inStock: true,
    trending: true,
    rating: 4.8,
    reviews: 198
  },
  // Bangles
  {
    id: '12',
    name: 'Antique Gold Bangle Set',
    designNo: 'BGL-2024-01',
    grossWeight: 38.910,
    netWeight: 38.910,
    laborCharges: 12.5,
    size: '2.4',
    price: 89999,
    originalPrice: 99999,
    category: 'bangles',
    material: 'gold',
    occasion: 'bridal',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'
    ],
    description: 'Set of 4 traditional gold bangles with intricate patterns. Perfect for weddings.',
    inStock: true,
    featured: true,
    trending: true,
    rating: 4.8,
    reviews: 267
  },
  {
    id: '13',
    name: 'Diamond Studded Bangle',
    price: 145999,
    category: 'bangles',
    material: 'diamond',
    occasion: 'party',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500'
    ],
    description: 'Luxurious diamond studded bangle in 18K gold. Statement piece for special occasions.',
    inStock: true,
    rating: 4.9,
    reviews: 89
  },
  // Pendants
  {
    id: '14',
    name: 'Heart Diamond Pendant',
    designNo: 'HDP-1401-18K',
    grossWeight: 4.200,
    netWeight: 3.500,
    laborCharges: 15,
    price: 29999,
    category: 'pendants',
    material: 'diamond',
    occasion: 'gift',
    images: [
      '/images/products/heart_diamond_pendant.png'
    ],
    description: 'Romantic heart-shaped diamond pendant. Perfect gift for Valentine\'s Day or anniversary.',
    purity: '18K',
    diamondWeight: 0.25,
    diamondQuality: 'VS',
    inStock: true,
    featured: true,
    trending: true,
    rating: 4.7,
    reviews: 234
  },
  {
    id: '15',
    name: 'Om Gold Pendant',
    designNo: 'OGP-1502-22K',
    grossWeight: 2.500,
    netWeight: 2.200,
    laborCharges: 10,
    price: 15999,
    category: 'pendants',
    material: 'gold',
    purity: '22K',
    occasion: 'daily',
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500'
    ],
    description: 'Sacred Om pendant in 22K gold. Perfect for daily wear and spiritual occasions.',
    inStock: true,
    rating: 4.6,
    reviews: 156
  },
  {
    id: '16',
    name: 'Emerald Statement Pendant',
    designNo: 'ESP-1603-18K',
    grossWeight: 7.500,
    netWeight: 6.800,
    laborCharges: 18,
    price: 65999,
    originalPrice: 75999,
    category: 'pendants',
    material: 'gold',
    purity: '18K',
    occasion: 'party',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'
    ],
    description: 'Stunning emerald pendant with diamond accents. Set in 18K gold.',
    inStock: true,
    rating: 4.8,
    reviews: 98
  },
  {
    id: '17',
    name: 'Antique Floral Heritage Pendant',
    designNo: 'AFP-1704-22K',
    grossWeight: 14.200,
    netWeight: 12.500,
    laborCharges: 20,
    price: 84999,
    originalPrice: 99999,
    category: 'pendants',
    material: 'gold',
    purity: '22K',
    occasion: 'bridal',
    images: ['/images/products/antique_floral.png'],
    description: 'Traditional Indian antique gold pendant featuring a round floral motif with matte finish, rubies and pearls.',
    inStock: true,
    featured: true,
    trending: true,
    rating: 4.9,
    reviews: 42
  },
  {
    id: '18',
    name: 'Mughal Filigree Diamond Pendant',
    designNo: 'MFP-1805-18K',
    grossWeight: 11.800,
    netWeight: 10.200,
    laborCharges: 22,
    price: 112999,
    originalPrice: 135000,
    category: 'pendants',
    material: 'diamond',
    purity: '18K',
    diamondWeight: 0.85,
    diamondQuality: 'VVS',
    occasion: 'party',
    images: ['/images/products/mughal_filigree.png'],
    description: 'Intricate Mughal-inspired gold filigree pendant with delicate symmetrical patterns and diamond accents.',
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 35
  },
  {
    id: '19',
    name: 'Royal Lion Head Statement Pendant',
    designNo: 'RLP-1906-22K',
    grossWeight: 26.800,
    netWeight: 24.500,
    laborCharges: 25,
    price: 158999,
    category: 'pendants',
    material: 'gold',
    purity: '22K',
    occasion: 'party',
    images: ['/images/products/lion_head.png'],
    description: 'Bold sculptural Lion Head pendant in solid 22k yellow gold with emerald eyes and ornate scrollwork.',
    inStock: true,
    featured: true,
    trending: true,
    rating: 5.0,
    reviews: 18
  },
  {
    id: '20',
    name: 'Guardian Angel Diamond Pendant',
    designNo: 'GAP-2007-18K',
    grossWeight: 9.800,
    netWeight: 8.500,
    laborCharges: 18,
    price: 95999,
    originalPrice: 110000,
    category: 'pendants',
    material: 'diamond',
    purity: '18K',
    diamondWeight: 0.65,
    diamondQuality: 'VS',
    occasion: 'gift',
    images: ['/images/products/guardian_angel.png'],
    description: 'Modern Guardian Angel pendant with diamond-encrusted wings in white and yellow gold fusion.',
    inStock: true,
    trending: true,
    rating: 4.9,
    reviews: 64
  },

  {
    id: '21',
    name: 'Peacock Fusion Enamel Pendant',
    designNo: 'PFP-2108-GOLD',
    grossWeight: 18.500,
    netWeight: 14.200,
    laborCharges: 30,
    price: 76999,
    category: 'pendants',
    material: 'gold',
    occasion: 'party',
    images: ['/images/products/peacock_fusion.png'],
    description: 'Artistic peacock-inspired pendant with blue and green enamel work, gold and diamond accents.',
    inStock: true,
    rating: 4.7,
    reviews: 29
  },
  {
    id: '22',
    name: 'Eternal Bond Couple Rings',
    designNo: 'EBR-2209-18K',
    grossWeight: 12.400,
    netWeight: 11.800,
    laborCharges: 15,
    price: 85999,
    originalPrice: 99999,
    category: 'rings',
    material: 'diamond',
    occasion: 'bridal',
    images: ['/images/products/eternal_bond_rings.png'],
    description: 'A matching pair of 18K yellow gold bands featuring a graceful diamond-studded wave pattern representing an eternal bond.',
    inStock: true,
    featured: true,
    trending: true,
    rating: 5.0,
    reviews: 45
  },
  {
    id: '23',
    name: 'Royal Unity Couple Rings',
    designNo: 'RUR-2310-22K',
    grossWeight: 14.800,
    netWeight: 14.800,
    laborCharges: 12,
    price: 68999,
    category: 'rings',
    material: 'gold',
    occasion: 'bridal',
    images: ['/images/products/royal_unity_rings.png'],
    description: 'Exquisite 22K gold bands for him and her, featuring subtle royal crown engravings and a heritage antique finish.',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 32
  },
  {
    id: '24',
    name: 'Twin Souls Filigree Rings',
    designNo: 'TSF-2411-PLAT',
    grossWeight: 16.500,
    netWeight: 15.200,
    laborCharges: 25,
    price: 125999,
    originalPrice: 145000,
    category: 'rings',
    material: 'platinum',
    occasion: 'bridal',
    images: ['/images/products/twin_souls_rings.png'],
    description: 'Intricate Mughal-inspired filigree work in a fusion of yellow gold and platinum. A masterpiece of craftsmanship for couples.',
    inStock: true,
    trending: true,
    rating: 4.9,
    reviews: 21
  },
  {
    id: '25',
    name: 'Classic Love Matte Rings',
    designNo: 'CLR-2512-GOLD',
    grossWeight: 8.200,
    netWeight: 8.200,
    laborCharges: 10,
    price: 42999,
    category: 'rings',
    material: 'gold',
    occasion: 'daily',
    images: ['/images/products/classic_love_rings.png'],
    description: 'Modern minimalist couple bands in brushed matte rose gold with a hidden diamond set inside the inner band.',
    inStock: true,
    rating: 4.8,
    reviews: 56
  },
  {
    id: '26',
    name: 'Temple Gold Kangan',
    designNo: 'TGK-2613-22K',
    grossWeight: 52.400,
    netWeight: 48.500,
    laborCharges: 20,
    price: 145999,
    category: 'bangles',
    material: 'gold',
    occasion: 'bridal',
    images: ['/images/products/temple_gold_kangan.png'],
    description: 'Traditional heavy Indian kangan set in 22K yellow gold, featuring intricate hand-carved floral motifs and deep ruby stone accents. A heritage piece for auspicious occasions.',
    inStock: true,
    rating: 4.9,
    reviews: 12
  },
  {
    id: '27',
    name: 'Filigree Gold Bangles',
    designNo: 'FGB-2714-18K',
    grossWeight: 28.600,
    netWeight: 24.200,
    laborCharges: 15,
    price: 82999,
    category: 'bangles',
    material: 'gold',
    occasion: 'party',
    images: ['/images/products/filigree_gold_bangles.png'],
    description: 'A set of four delicate 18K gold bangles showcasing masterful filigree craftsmanship with honeycomb and floral cutout patterns. Polished to a brilliant shine.',
    inStock: true,
    rating: 4.7,
    reviews: 8
  }
];

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Bridal Collection 2024',
    subtitle: 'Up to 30% off on exclusive wedding jewellery',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200',
    link: '/category/necklaces?occasion=bridal'
  },
  {
    id: '2',
    title: 'Diamond Fest',
    subtitle: 'Sparkle with our diamond collection',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200',
    link: '/category/rings?material=diamond'
  },
  {
    id: '3',
    title: 'Gold Coins Festival',
    subtitle: 'Pure 24K gold coins for every occasion',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200',
    link: '/category/coins'
  }
];

export const categories: Category[] = [
  { id: 'rings', name: 'Rings', icon: '💍', count: 24 },
  { id: 'necklaces', name: 'Necklaces', icon: '📿', count: 18 },
  { id: 'earrings', name: 'Earrings', icon: '✨', count: 32 },
  { id: 'coins', name: 'Coins', icon: '🪙', count: 8 },
  { id: 'bangles', name: 'Bangles', icon: '⭕', count: 15 },
  { id: 'pendants', name: 'Pendants', icon: '💎', count: 21 }
];

export const materials = [
  { id: 'gold', name: 'Gold', color: '#FFD700' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0' },
  { id: 'diamond', name: 'Diamond', color: '#B9F2FF' },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2' }
];

export const occasions = [
  { id: 'bridal', name: 'Bridal' },
  { id: 'daily', name: 'Daily Wear' },
  { id: 'party', name: 'Party Wear' },
  { id: 'gift', name: 'Gifting' }
];
