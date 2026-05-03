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
    let price = product.price; // Start with base price (mostly for diamonds/labor)

    if (product.material === 'gold') {
      const purity = selectedPurity || product.purity || '22K';
      const rate = purity === '24K' ? rates.gold24K : 
                   purity === '22K' ? rates.gold22K : 
                   purity === '18K' ? rates.gold18K : rates.gold14K;
      
      if (product.metalWeight) {
        const metalCost = product.metalWeight * rate;
        const makingCost = (product.makingCharges || 0) * (product.makingChargesPerGram ? product.metalWeight : 1);
        price = metalCost + makingCost;
      }
    } else if (product.material === 'silver' && product.metalWeight) {
      price = (product.metalWeight * rates.silver) + (product.makingCharges || 0);
    } else if (product.material === 'platinum' && product.metalWeight) {
      price = (product.metalWeight * rates.platinum) + (product.makingCharges || 0);
    }

    return Math.round(price);
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
