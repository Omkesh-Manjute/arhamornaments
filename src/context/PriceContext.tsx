import React, { createContext, useContext, useState, useEffect } from 'react';

interface MetalRates {
  gold24K: number; gold22K: number; gold18K: number; gold14K: number;
  silver: number; platinum: number;
}
interface MakingCharges {
  rings: number; necklaces: number; earrings: number;
  bangles: number; pendants: number; mangalsutra: number; coins: number;
}
interface PriceContextType {
  rates: MetalRates; setRates: (r: MetalRates) => void;
  makingCharges: MakingCharges; setMakingCharges: (m: MakingCharges) => void;
  calculateProductPrice: (product: any, selectedPurity?: string) => number;
  isLoading: boolean;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const DEFAULT_RATES: MetalRates = {
  gold24K: 14716, gold22K: 14015, gold18K: 11400, gold14K: 8900,
  silver: 265, platinum: 4500
};
const DEFAULT_MAKING: MakingCharges = {
  rings: 12, necklaces: 10, earrings: 12,
  bangles: 8, pendants: 10, mangalsutra: 10, coins: 5
};

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRatesState] = useState<MetalRates>(() => {
    try { const s = localStorage.getItem('arham_rates'); return s ? JSON.parse(s) : DEFAULT_RATES; } catch { return DEFAULT_RATES; }
  });
  const [makingCharges, setMakingChargesState] = useState<MakingCharges>(() => {
    try { const s = localStorage.getItem('arham_making'); return s ? JSON.parse(s) : DEFAULT_MAKING; } catch { return DEFAULT_MAKING; }
  });
  const [isLoading] = useState(false);

  const setRates = (r: MetalRates) => { setRatesState(r); localStorage.setItem('arham_rates', JSON.stringify(r)); };
  const setMakingCharges = (m: MakingCharges) => { setMakingChargesState(m); localStorage.setItem('arham_making', JSON.stringify(m)); };

  const calculateProductPrice = (product: any, selectedPurity?: string) => {
    const weight = product.netWeight || product.metalWeight || 0;
    const categoryMaking = makingCharges[product.category as keyof MakingCharges] || 10;
    const laborPct = product.laborCharges ?? categoryMaking;
    let price = product.price || 0;
    if (product.material === 'gold') {
      const purity = selectedPurity || product.purity || '22K';
      const rate = purity === '24K' ? rates.gold24K : purity === '22K' ? rates.gold22K : purity === '18K' ? rates.gold18K : rates.gold14K;
      if (weight > 0) { const m = weight * rate; price = m + m * (laborPct / 100); }
    } else if (product.material === 'silver' && weight > 0) {
      const m = weight * rates.silver; price = m + m * (laborPct / 100);
    } else if (product.material === 'platinum' && weight > 0) {
      const m = weight * rates.platinum; price = m + m * (laborPct / 100);
    }
    return Math.round(price * 1.03);
  };

  return (
    <PriceContext.Provider value={{ rates, setRates, makingCharges, setMakingCharges, calculateProductPrice, isLoading }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => {
  const c = useContext(PriceContext);
  if (!c) throw new Error('usePrice must be used within PriceProvider');
  return c;
};
