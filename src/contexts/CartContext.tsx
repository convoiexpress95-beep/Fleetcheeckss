import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface CartItem {
  id: string; // identifiant unique produit
  name: string;
  price: number; // prix unitaire hors taxe (EUR par défaut)
  quantity: number;
  imageUrl?: string;
  meta?: Record<string, any>;
  currency?: string; // 'EUR' par défaut
  kind?: 'credit' | 'physical' | 'service';
  creditAmount?: number; // nombre de crédits que cet article ajoute si kind = credit
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  subTotal: number; // total HT avant remise / TVA
  discountTotal: number; // montant de remise
  vatTotal: number; // TVA totale
  grandTotal: number; // TTC après remise
  currency: string;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  activePromo?: string | null;
  creditsInCart: number; // somme des crédits potentiels
}

// Singleton stable pour éviter duplication en HMR
const CartContext: React.Context<CartContextValue | undefined> = (() => {
  if (typeof window !== 'undefined') {
    const g = window as any;
    if (g.__CART_CONTEXT_SINGLETON__) return g.__CART_CONTEXT_SINGLETON__;
    const c = createContext<CartContextValue | undefined>(undefined);
    g.__CART_CONTEXT_SINGLETON__ = c;
    return c;
  }
  return createContext<CartContextValue | undefined>(undefined);
})();
const STORAGE_KEY = 'cart:v2';

// Promo codes simples (client-side) – en prod: valider côté Edge Function
const PROMOS: Record<string,{percent:number; max?:number}> = {
  START10: { percent: 10 },
  BOOST20: { percent: 20 },
  VIP30: { percent: 30 }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const currency = 'EUR';

  // Hydratation localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.warn('Cart storage parse error', e);
    }
  }, []);

  // Persistance
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart storage write error', e);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p);
      }
      // auto classification credit pack
      const inferred: CartItem = {
        currency,
        kind: item.kind || (item.id.startsWith('pack-') ? 'credit' : 'physical'),
        creditAmount: item.creditAmount || (item.id.startsWith('pack-') ? inferCreditsFromName(item.name) : undefined),
        ...item,
        quantity
      } as CartItem;
      return [...prev, inferred];
    });
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p));
  };

  const clear = () => setItems([]);

  const { totalCount, subTotalRaw, creditsInCart } = useMemo(() => {
    return {
      totalCount: items.reduce((acc, i) => acc + i.quantity, 0),
      subTotalRaw: items.reduce((acc, i) => acc + i.quantity * i.price, 0),
      creditsInCart: items.filter(i => i.kind === 'credit').reduce((acc, i) => acc + (i.creditAmount || 0) * i.quantity, 0)
    };
  }, [items]);

  // Remise
  const discountTotal = useMemo(() => {
    if (!promo) return 0;
    const def = PROMOS[promo];
    if (!def) return 0;
    return (subTotalRaw * def.percent) / 100;
  }, [promo, subTotalRaw]);

  // TVA: 20% sur items non credit (exemple). Crédit = service exonéré ici (0%)
  const vatTotal = useMemo(() => {
    const taxable = items
      .filter(i => i.kind !== 'credit')
      .reduce((acc, i) => acc + i.price * i.quantity, 0);
    return taxable * 0.2;
  }, [items]);

  const subTotal = subTotalRaw;
  const grandTotal = Math.max(0, subTotal - discountTotal + vatTotal);

  const applyPromo = (code: string) => {
    const up = code.trim().toUpperCase();
    if (!PROMOS[up]) return false;
    setPromo(up);
    return true;
  };
  const removePromo = () => setPromo(null);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    totalCount,
    subTotal,
    discountTotal,
    vatTotal,
    grandTotal,
    currency,
    applyPromo,
    removePromo,
    activePromo: promo,
    creditsInCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

// Helpers
function inferCreditsFromName(name: string): number | undefined {
  const m = name.match(/(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (!isNaN(n)) return n;
  }
  return undefined;
}
