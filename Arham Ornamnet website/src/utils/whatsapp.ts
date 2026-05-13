import { Product, CartItem } from '../types';

// WhatsApp business number - replace with actual number
const WHATSAPP_NUMBER = '919371504182';

export const generateProductEnquiryMessage = (product: Product): string => {
  const price = product?.price || 0;
  const message = `Hi! I'm interested in this product from ARHAM ORNAMENTS:

*${product?.name || 'Product'}*
Price: ₹${price.toLocaleString('en-IN')}
Category: ${product?.category || ''}
Material: ${product?.material || ''}

Product Link: ${window.location.origin}/product/${product?.id}

Please share more details about availability and customization options.`;

  return encodeURIComponent(message);
};

export const generateCartOrderMessage = (items: CartItem[], customerDetails?: {
  name: string;
  phone: string;
  address: string;
}, discountAmount: number = 0): string => {
  // Filter out invalid items before building message
  const validItems = items.filter(item => item && item.product);
  const itemsList = validItems.map(item => {
    const price = item.product?.price || 0;
    const name = item.product?.name || 'Product';
    const qty = item.quantity || 1;
    return `• ${name} x${qty} - ₹${(price * qty).toLocaleString('en-IN')}`;
  }).join('\n');

  const total = validItems.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);

  let message = `Hello! I want to place an order from ARHAM ORNAMENTS:

*Order Details:*
${itemsList}


*Subtotal: ₹${total.toLocaleString('en-IN')}*`;

  if (discountAmount > 0) {
    message += `\n*Wallet Discount: -₹${discountAmount.toLocaleString('en-IN')}*`;
    message += `\n*Final Total: ₹${(total - discountAmount).toLocaleString('en-IN')}*`;
  } else {
    message += `\n*Total: ₹${total.toLocaleString('en-IN')}*`;
  }

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

export const formatPrice = (price: number | undefined | null): string => {
  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  return `₹${safePrice.toLocaleString('en-IN')}`;
};

export const calculateDiscount = (original: number, current: number): number => {
  return Math.round(((original - current) / original) * 100);
};
