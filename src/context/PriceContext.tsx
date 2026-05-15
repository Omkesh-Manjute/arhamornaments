import React, { createContext, useContext, useState, useEffect } from 'react';

interface MetalRates {
  gold24K: number; gold22K: number; gold18K: number;
  silver: number; silver1kg: number; platinum: number;
}
interface MakingCharges {
  rings: number; necklaces: number; earrings: number;
  bangles: number; pendants: number; mangalsutra: number; coins: number;
  bracelets: number; 'chain-sets': number; chains: number; kadas: number;
  'necklace-sets': number; 'nose-jewelry': number; 'pendant-sets': number;
  'temple-necklaces': number; thushi: number;
}
interface PriceContextType {
  rates: MetalRates; setRates: (r: MetalRates) => void;
  makingCharges: MakingCharges; setMakingCharges: (m: MakingCharges) => void;
  calculateProductPrice: (product: any, selectedPurity?: string) => number;
  isLoading: boolean;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const DEFAULT_RATES: MetalRates = {
  gold24K: 14716, gold22K: 14015, gold18K: 11400,
  silver: 95, silver1kg: 92000, platinum: 4500
};
const DEFAULT_MAKING: MakingCharges = {
  rings: 12, necklaces: 10, earrings: 12,
  bangles: 8, pendants: 10, mangalsutra: 10, coins: 5,
  bracelets: 10, 'chain-sets': 10, chains: 10, kadas: 10,
  'necklace-sets': 10, 'nose-jewelry': 10, 'pendant-sets': 10,
  'temple-necklaces': 10, thushi: 10
};

import { configService } from '../services/configService';

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRatesState] = useState<MetalRates>(() => {
    try { const s = localStorage.getItem('arham_rates'); return s ? JSON.parse(s) : DEFAULT_RATES; } catch { return DEFAULT_RATES; }
  });
  const [makingCharges, setMakingChargesState] = useState<MakingCharges>(() => {
    try { const s = localStorage.getItem('arham_making'); return s ? JSON.parse(s) : DEFAULT_MAKING; } catch { return DEFAULT_MAKING; }
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    const unsubRates = configService.subscribeToRates((newRates) => {
      if (newRates) {
        setRatesState(newRates as MetalRates);
        localStorage.setItem('arham_rates', JSON.stringify(newRates));
      }
    });

    const unsubMaking = configService.subscribeToMakingCharges((newMaking) => {
      if (newMaking) {
        // Ensure newMaking has all required keys by merging with default
        const mergedMaking = { ...DEFAULT_MAKING, ...newMaking };
        setMakingChargesState(mergedMaking as MakingCharges);
        localStorage.setItem('arham_making', JSON.stringify(mergedMaking));
      }
    });

    return () => {
      unsubRates();
      unsubMaking();
    };
  }, []);

  const setRates = (r: MetalRates) => { setRatesState(r); localStorage.setItem('arham_rates', JSON.stringify(r)); };
  const setMakingCharges = (m: MakingCharges) => { setMakingChargesState(m); localStorage.setItem('arham_making', JSON.stringify(m)); };

  const calculateProductPrice = (product: any, selectedPurity?: string) => {
    if (!product) return 0;
    
    const weight = parseFloat(product.netWeight || product.metalWeight) || 0;
    const categoryKey = (product.category || '').toLowerCase().trim();
    const categoryMaking = (makingCharges as any)[categoryKey] || 
                          (makingCharges as any)[categoryKey.replace(/\s+/g, '-')] || 10;
    
    const laborPct = product.laborCharges ?? categoryMaking;
    let price = product.price || 0;

    if (product.material === 'gold') {
      const purity = selectedPurity || product.purity || '22K';
      const rate = rates[`gold${purity}` as keyof MetalRates] || rates.gold22K;
      if (weight > 0) {
        const base = weight * rate;
        price = base + base * (laborPct / 100);
      }
    } else if (product.material === 'silver' && weight > 0) {
      const base = weight * rates.silver;
      price = base + base * (laborPct / 100);
    } else if (product.material === 'platinum' && weight > 0) {
      const base = weight * rates.platinum;
      price = base + base * (laborPct / 100);
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
