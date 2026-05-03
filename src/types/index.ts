export interface Product {
  id: string;
  name: string;
  price: number; // Base price or calculated price
  originalPrice?: number;
  category: 'rings' | 'necklaces' | 'earrings' | 'coins' | 'bangles' | 'pendants';
  material: 'gold' | 'silver' | 'diamond' | 'platinum';
  
  // Jewelry specific details
  designNo?: string;
  grossWeight?: number; // Gwt
  netWeight?: number;   // Nwt
  laborCharges?: number; // Lbr % (Making charges)
  size?: string;

  metalWeight?: number; // Keep for backward compatibility
  makingCharges?: number; // Keep for backward compatibility
  purity?: '14K' | '18K' | '22K' | '24K';
  diamondWeight?: number; // In carats
  diamondQuality?: 'SI' | 'VS' | 'VVS';
  occasion: 'bridal' | 'daily' | 'party' | 'gift';
  images: string[];
  description: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
  rating: number;
  reviews: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  joinedDate: string;
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

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
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

