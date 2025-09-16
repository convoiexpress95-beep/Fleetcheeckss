# Plan Checkout Panier -> Crédits

## Objectif
Convertir les articles de type `credit` du panier en augmentation de crédits utilisateur après paiement confirmé (Mollie / autre PSP).

## Flux Proposé
1. Front: utilisateur clique "Procéder au paiement" => appelle Edge Function `create-cart-payment` en envoyant le contenu du panier (items, total, hash d'intégrité, promo).
2. Edge Function:
   - Valide la signature des items (prix serveur vs prix client) via table `catalog_products` (à créer) + mapping des packs de crédits.
   - Recalcule: subtotal, remise promo (validate), TVA.
   - Crée en base une entrée `cart_orders` (status=pending, amount, user_id, items JSONB, promo_code, vat_amount, discount_amount, credits_expected).
   - Crée le paiement Mollie (ou autre) -> renvoie checkoutUrl + orderId.
3. Front: redirige vers PSP (nouvel onglet) puis l'utilisateur revient.
4. Front: sur retour `success`, appelle Edge Function `capture-cart-payment` avec orderId + paymentId.
5. Edge Function `capture-cart-payment`:
   - Vérifie paiement PSP.
   - Marque order status=paid.
   - Incrémente crédits (via RPC ou update direct + transaction) de `credits_expected`.
   - Insère transaction `credit_transactions` (type=purchase, credits_used négatif).
   - Retourne nouveau solde.
6. Front: vide le panier, rafraîchit `useCredits().loadBalance()`.

## Tables à créer (exemples SQL)
```sql
create table cart_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending',
  amount numeric not null,
  currency text not null default 'EUR',
  subtotal numeric not null,
  vat_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  promo_code text,
  credits_expected int not null default 0,
  items jsonb not null,
  payment_provider text default 'mollie',
  payment_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);
create index on cart_orders(user_id);
```

## Sécurité / Intégrité
- Hash d'intégrité côté front: SHA-256(JSON.stringify(items triés)). Edge refait son propre tri + hash et compare.
- Prix forcés côté serveur depuis référentiel produits (ignore le prix client si divergence).
- Promo codes validés côté serveur (table `promo_codes`: code, percent, active, expires_at, usage_limit, per_user_limit).

## Endpoint Edge (pseudo)
```ts
// create-cart-payment
// body: { items: CartItemDTO[], promo?: string }
// validate -> compute -> create order -> create mollie payment -> return { orderId, checkoutUrl }
```
```ts
// capture-cart-payment
// body: { orderId, paymentId }
// verify PSP -> update order -> add credits -> return { creditsAdded, newBalance }
```

## Front TODO
- Implémenter appel create-cart-payment dans bouton paiement.
- Stocker orderId en sessionStorage jusqu'à capture.
- Sur succès capture: clear() panier + refresh credits.

## Etapes Futures
- Gérer produits physiques (logs shipping) séparé.
- Support multi-devise.
- Webhook PSP pour confirmer tardivement (idempotence capture).
```
