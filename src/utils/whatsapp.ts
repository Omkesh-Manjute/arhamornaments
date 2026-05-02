import { Product, CartItem } from '../types';

// WhatsApp business number - replace with actual number
const WHATSAPP_NUMBER = '919371504182';

export const generateProductEnquiryMessage = (product: Product): string => {
  const message = `Hi! I'm interested in this product from ARHAM ORNAMENTS:

*${product.name}*
Price: ₹${product.price.toLocaleString('en-IN')}
Category: ${product.category}
Material: ${product.material}

Product Link: ${window.location.origin}/product/${product.id}

Please share more details about availability and customization options.`;

  return encodeURIComponent(message);
};

export const generateCartOrderMessage = (items: CartItem[], customerDetails?: {
  name: string;
  phone: string;
  address: string;
}): string => {
  const itemsList = items.map(item => 
    `• ${item.product.name} x${item.quantity} - ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`
  ).join('\n');

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let message = `Hello! I want to place an order from ARHAM ORNAMENTS:

*Order Details:*
${itemsList}

*Total: ₹${total.toLocaleString('en-IN')}*`;

  if (customerDetails) {
    message += `

*Customer Details:*
Name: ${customerDetails.name}
Phone: ${customerDetails.phone}
Address: ${customerDetails.address}`;
  }

  message += '\n\nPlease confirm my order and share payment options.';

  return encodeURIComponent(message);
};

export const openWhatsApp = (message: string): void => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank');
};

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export const calculateDiscount = (original: number, current: number): number => {
  return Math.round(((original - current) / original) * 100);
};
