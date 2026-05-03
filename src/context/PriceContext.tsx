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
  const [rates, setRates] = useState<MetalRates>({
    gold24K: 7450,
    gold22K: 6830,
    gold18K: 5580,
    gold14K: 4340,
    silver: 92,
    platinum: 3200
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch for live rates
    const fetchRates = () => {
      // In a real app, this would be an API call
      // For now, we simulate small fluctuations
      const fluctuation = () => (Math.random() - 0.5) * 10;
      setRates(prev => ({
        gold24K: prev.gold24K + fluctuation(),
        gold22K: prev.gold22K + fluctuation(),
        gold18K: prev.gold18K + fluctuation(),
        gold14K: prev.gold14K + fluctuation(),
        silver: prev.silver + fluctuation() / 10,
        platinum: prev.platinum + fluctuation()
      }));
      setIsLoading(false);
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
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
