import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Product, GiftOptions } from '../types';

interface CartContextType {
  items: CartItem[];
  giftOptions: GiftOptions;
  addToCart: (product: Product, quantity?: number, metadata?: { selectedPurity?: string, selectedQuality?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateGiftOptions: (options: Partial<GiftOptions>) => void;
  clearCart: () => void;
  totalPrice: number;
  walletRedemption: { isRedeemed: boolean };
  toggleWalletRedemption: () => void;
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

  const [walletRedemption, setWalletRedemption] = useState({ isRedeemed: false });

  const saveToStorage = useCallback((cartItems: CartItem[], options: GiftOptions) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('giftOptions', JSON.stringify(options));
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1, metadata?: { selectedPurity?: string, selectedQuality?: string }) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        item.selectedPurity === metadata?.selectedPurity &&
        item.selectedDiamondQuality === metadata?.selectedQuality
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        };
      } else {
        newItems = [...prev, { 
          product, 
          quantity,
          selectedPurity: metadata?.selectedPurity,
          selectedDiamondQuality: metadata?.selectedQuality
        }];
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
    setWalletRedemption({ isRedeemed: false });
    localStorage.removeItem('cart');
    localStorage.removeItem('giftOptions');
  }, []);

  const toggleWalletRedemption = useCallback(() => {
    setWalletRedemption(prev => ({ isRedeemed: !prev.isRedeemed }));
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
      totalPrice,
      walletRedemption,
      toggleWalletRedemption
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
