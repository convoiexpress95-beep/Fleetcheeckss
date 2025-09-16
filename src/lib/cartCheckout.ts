import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

async function sha256(str: string) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function createCartPayment(items: CartItem[], promo?: string) {
  const normalized = [...items].sort((a,b)=> a.id.localeCompare(b.id));
  const base = JSON.stringify({ items: normalized.map(i=>({ id: i.id, quantity: i.quantity })), promo: promo||null });
  const hash = await sha256(base);
  const { data, error } = await supabase.functions.invoke('create-cart-payment', {
  body: { items: normalized.map(i=>({ id: i.id, quantity: i.quantity })), promo, hash }
  });
  if (error) throw error;
  return data as { orderId: string; checkoutUrl: string; amount: number; currency: string; hash: string };
}

export async function captureCartPayment(orderId: string) {
  const { data, error } = await supabase.functions.invoke('capture-cart-payment', {
    body: { orderId }
  });
  if (error) throw error;
  return data as { success?: boolean; creditsAdded?: number; already?: boolean };
}
