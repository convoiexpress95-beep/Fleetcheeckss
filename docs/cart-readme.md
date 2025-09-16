# Cart / Checkout (Serveur Autoritatif)

## Contrat Edge `create-cart-payment`
Input:
```json
{
  "items": [ { "id": "pack-pro", "quantity": 2 } ],
  "promo": "START10",
  "hash": "sha256(items+promo côté client)"
}
```
Le serveur recharge les produits depuis `catalog_products` et ignore les prix client.

## Contrat Edge `capture-cart-payment`
Input:
```json
{ "orderId": "uuid" }
```
Sortie: `{ success: true, creditsAdded: 25 }`.

## Sécurité
- Hash d'intégrité: prévient altération (quantités / ajout promo) entre création et ouverture (facultatif avec serveur autoritatif mais utile).
- RLS garantit qu'un utilisateur n'accède qu'à ses commandes.
- Les remises sont validées via `promo_codes`.

## Étapes PSP Réelles (futur)
1. Remplacer `payment_provider: 'mock'` par 'mollie'.
2. Créer paiement Mollie avec `webhookUrl`.
3. Webhook → Edge function `webhook-mollie` -> set paid.
4. Front poll capture ou rely redirect + capture sécurisée.

## TODO techniques
- Idempotence capture (colonne external_ref unique).
- Limites d'utilisation promo (`used_count`, `per_user_limit`).
- Tests unitaires vitest (hash, compute totals) côté front.
