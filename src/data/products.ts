import { Product, Banner, Category } from '../types';

export const products: Product[] = [];

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
    image: '/images/products/gold_coin_1.jpg',
    link: '/category/coins'
  }
];

export const categories: Category[] = [
  { id: 'earrings', name: 'Earrings', icon: '✨', count: 0 },
  { id: 'rings', name: 'Rings', icon: '💍', count: 0 },
  { id: 'bracelets', name: 'Bracelets', icon: '📿', count: 0 },
  { id: 'nose-jewelry', name: 'Nose Jewelry', icon: '💎', count: 0 },
  { id: 'necklaces', name: 'Necklaces', icon: '📿', count: 0 },
  { id: 'pendants', name: 'Pendants', icon: '💎', count: 0 },
  { id: 'pendant-sets', name: 'Pendant Sets', icon: '✨', count: 0 },
  { id: 'bangles', name: 'Bangles', icon: '⭕', count: 0 },
  { id: 'mangalsutra', name: 'Mangalsutra', icon: '📿', count: 0 },
  { id: 'coins', name: 'Coins', icon: '🪙', count: 0 },
  { id: 'chain-sets', name: 'Chain Sets', icon: '🔗', count: 0 },
  { id: 'chains', name: 'Chains', icon: '⛓️', count: 0 },
  { id: 'kadas', name: 'Kadas', icon: '⭕', count: 0 },
  { id: 'necklace-sets', name: 'Necklace Sets', icon: '📿', count: 0 },
  { id: 'temple-necklaces', name: 'Temple Necklaces', icon: '🔱', count: 0 },
  { id: 'thushi', name: 'Thushi', icon: '📿', count: 0 }
];

export const materials = [
  { id: 'gold', name: 'Gold', color: '#FFD700' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0' },
  { id: 'diamond', name: 'Diamond', color: '#B9F2FF' },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2' }
];

export const occasions = [
  { id: 'office', name: 'Office Wear' },
  { id: 'modern', name: 'Modern Wear' },
  { id: 'casual', name: 'Casual Wear' },
  { id: 'traditional', name: 'Traditional Wear' },
  { id: 'bridal', name: 'Bridal' },
  { id: 'daily', name: 'Daily Wear' },
  { id: 'party', name: 'Party Wear' },
  { id: 'gift', name: 'Gifting' }
];
