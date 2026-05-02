export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'rings' | 'necklaces' | 'earrings' | 'coins' | 'bangles' | 'pendants';
  material: 'gold' | 'silver' | 'diamond' | 'platinum';
  occasion: 'bridal' | 'daily' | 'party' | 'gift';
  images: string[];
  description: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
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
  createdAt: Date;
}
