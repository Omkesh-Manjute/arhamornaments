import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Product, GiftOptions } from '../types';

interface CartContextType {
  items: CartItem[];
  giftOptions: GiftOptions;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateGiftOptions: (options: Partial<GiftOptions>) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const defaultGiftOptions: GiftOptions = {
  isGift: false,
  wrapType: 'standard',
  message: '',
  videoMessageUrl: ''
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [giftOptions, setGiftOptions] = useState<GiftOptions>(() => {
    const saved = localStorage.getItem('giftOptions');
    return saved ? JSON.parse(saved) : defaultGiftOptions;
  });

  const saveToStorage = useCallback((cartItems: CartItem[], options: GiftOptions) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('giftOptions', JSON.stringify(options));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newItems;
      if (existing) {
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev, { product, quantity: 1 }];
      }
      saveToStorage(newItems, giftOptions);
      return newItems;
    });
  }, [saveToStorage, giftOptions]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId);
      saveToStorage(newItems, giftOptions);
      return newItems;
    });
  }, [saveToStorage, giftOptions]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveToStorage(newItems, giftOptions);
      return newItems;
    });
  }, [removeFromCart, saveToStorage, giftOptions]);

  const updateGiftOptions = useCallback((options: Partial<GiftOptions>) => {
    setGiftOptions(prev => {
      const newOptions = { ...prev, ...options };
      saveToStorage(items, newOptions);
      return newOptions;
    });
  }, [items, saveToStorage]);

  const clearCart = useCallback(() => {
    setItems([]);
    setGiftOptions(defaultGiftOptions);
    localStorage.removeItem('cart');
    localStorage.removeItem('giftOptions');
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const giftCharges = giftOptions.isGift && giftOptions.wrapType === 'luxury' ? 499 : 0;
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) + giftCharges;

  return (
    <CartContext.Provider value={{
      items,
      giftOptions,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateGiftOptions,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
