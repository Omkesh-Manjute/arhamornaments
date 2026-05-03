import React, { createContext, useContext, useState, useEffect } from 'react';

interface MetalRates {
  gold24K: number;
  gold22K: number;
  gold18K: number;
  gold14K: number;
  silver: number;
  platinum: number;
}

interface PriceContextType {
  rates: MetalRates;
  calculateProductPrice: (product: any, selectedPurity?: string) => number;
  isLoading: boolean;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates] = useState<MetalRates>({
    gold24K: 14716,
    gold22K: 14015,
    gold18K: 11400,
    gold14K: 8900,
    silver: 265,
    platinum: 4500
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Live rates are now set to specific values requested by the user
    setIsLoading(false);
  }, []);

  const calculateProductPrice = (product: any, selectedPurity?: string) => {
    let price = product.price || 0;

    const weight = product.netWeight || product.metalWeight || 0;
    const laborPercentage = product.laborCharges || 0;

    if (product.material === 'gold') {
      const purity = selectedPurity || product.purity || '22K';
      const rate = purity === '24K' ? rates.gold24K : 
                   purity === '22K' ? rates.gold22K : 
                   purity === '18K' ? rates.gold18K : rates.gold14K;
      
      if (weight > 0) {
        const metalCost = weight * rate;
        const laborCost = metalCost * (laborPercentage / 100);
        price = metalCost + laborCost;
      }
    } else if (product.material === 'silver' && weight > 0) {
      const metalCost = weight * rates.silver;
      const laborCost = metalCost * (laborPercentage / 100);
      price = metalCost + laborCost;
    } else if (product.material === 'platinum' && weight > 0) {
      const metalCost = weight * rates.platinum;
      const laborCost = metalCost * (laborPercentage / 100);
      price = metalCost + laborCost;
    } else if (product.material === 'diamond') {
      // For diamonds, we use the base price + any metal cost if weight is provided
      if (weight > 0) {
        const purity = selectedPurity || product.purity || '18K';
        const rate = purity === '24K' ? rates.gold24K : 
                     purity === '22K' ? rates.gold22K : 
                     purity === '18K' ? rates.gold18K : rates.gold14K;
        const metalCost = weight * rate;
        const laborCost = metalCost * (laborPercentage / 100);
        price = (product.price || 0) + metalCost + laborCost;
      }
    }

    // Add GST (3% standard for jewelry in India)
    const finalPrice = price * 1.03;

    return Math.round(finalPrice);
  };

  return (
    <PriceContext.Provider value={{ rates, calculateProductPrice, isLoading }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
};
