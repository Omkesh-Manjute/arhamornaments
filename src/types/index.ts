export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  netWeight?: number;
  inStock: boolean;
}

export interface DiamondAttribute {
  type: string;
  weight: number;
  clarity: string;
  color: string;
  count: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'rings' | 'necklaces' | 'earrings' | 'coins' | 'bangles' | 'pendants' | 'mangalsutra' | 'bracelets' | 'nose-jewelry' | 'pendant-sets' | 'chain-sets' | 'chains' | 'kadas' | 'necklace-sets' | 'temple-necklaces' | 'thushi';
  batchNo?: string;
  material: 'gold' | 'silver' | 'diamond' | 'platinum';

  // Jewelry specific details
  designNo?: string;
  grossWeight?: number;
  netWeight?: number;
  laborCharges?: number;
  makingCharge?: number;
  size?: string;
  purity?: string; // e.g., '14K', '18K', '22K', '24K', '925'

  // Material Attributes
  goldDetails?: {
    purity: string;
    weight: number;
  };
  silverDetails?: {
    purity: string;
    weight: number;
  };
  diamondDetails?: DiamondAttribute[];

  variants?: ProductVariant[];

  gender?: 'men' | 'women' | 'unisex';
  occasion?: string;
  images: string[];
  description: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
  rating: number;
  reviews: number;
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'order' | 'system';
  date: string;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string; // Kept for backward compatibility if needed, but we'll use specific fields
  streetAddress?: string;
  city?: string;
  pincode?: string;
  walletBalance: number;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  joinedDate: string;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  monthlyReferralCount?: number;
  lastReferralMonth?: string; // Format: 'YYYY-MM'
  lastSpinDate?: string;
  notifications: Notification[];
}

export interface GiftOptions {
  isGift: boolean;
  message?: string;
  wrapType?: 'standard' | 'luxury';
  videoMessageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPurity?: string;
  selectedDiamondQuality?: string;
  giftOptions?: GiftOptions;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
  order: number;
}


export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  giftOptions?: GiftOptions;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
}

