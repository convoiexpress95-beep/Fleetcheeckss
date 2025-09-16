import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types.extended';

// NOTE: utilise désormais les types étendus (types.extended.ts) incluant credits_* & trajet_join_requests

type CreditsWalletRow = Database['public']['Tables']['credits_wallets']['Row'];
type CreditsLedgerInsert = Database['public']['Tables']['credits_ledger']['Insert'];

// Débite un nombre de crédits (amount positif => débit) du wallet utilisateur et écrit une ligne ledger.
// Retourne le nouveau solde.
export async function debitCredits(params: { userId: string; amount: number; reason: string; refType?: string; refId?: string }) {
  const { userId, amount, reason, refType, refId } = params;
  if (amount <= 0) throw new Error('Le montant à débiter doit être > 0');
  // Lecture wallet courant
  const { data: wallet, error: wErr } = await supabase
    .from('credits_wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (wErr) throw wErr;
  const current = wallet?.balance ?? 0;
  if (current < amount) throw new Error('SOLDE_INSUFFISANT');
  const newBalance = current - amount;
  const { error: upErr } = await supabase
    .from('credits_wallets')
    .upsert({ user_id: userId, balance: newBalance }, { onConflict: 'user_id' });
  if (upErr) throw upErr;
  const { error: ledErr } = await supabase.from('credits_ledger').insert({
    user_id: userId,
    amount: -amount,
    reason,
    ref_type: refType || null,
    ref_id: refId || null,
  } as CreditsLedgerInsert);
  if (ledErr) throw ledErr;
  return newBalance;
}

export async function ensureWallet(userId: string) {
  const { data, error } = await supabase
    .from('credits_wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
  const { error: insErr } = await supabase.from('credits_wallets').insert({ user_id: userId, balance: 0 });
    if (insErr) throw insErr;
    return 0;
  }
  return data.balance;
}

export async function getWalletBalance(userId: string) {
  const { data, error } = await supabase
    .from('credits_wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.balance ?? 0;
}

export async function hasAtLeastCredits(userId: string, min: number) {
  const bal = await getWalletBalance(userId);
  return bal >= min;
}

// Crédite le wallet (ajout de crédits) et écrit une ligne ledger positive.
export async function creditCredits(params: { userId: string; amount: number; reason: string; refType?: string; refId?: string }) {
  const { userId, amount, reason, refType, refId } = params;
  if (amount <= 0) throw new Error('Le montant à créditer doit être > 0');
  const { data: wallet, error: wErr } = await supabase
    .from('credits_wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (wErr) throw wErr;
  const current = wallet?.balance ?? 0;
  const newBalance = current + amount;
  const { error: upErr } = await supabase
    .from('credits_wallets')
    .upsert({ user_id: userId, balance: newBalance }, { onConflict: 'user_id' });
  if (upErr) throw upErr;
  const { error: ledErr } = await supabase.from('credits_ledger').insert({
    user_id: userId,
    amount: amount,
    reason,
    ref_type: refType || null,
    ref_id: refId || null,
  } as CreditsLedgerInsert);
  if (ledErr) throw ledErr;
  return newBalance;
}