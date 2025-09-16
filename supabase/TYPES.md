# Génération & Extension des Types Supabase

Ce projet utilise deux couches de types :

1. `src/integrations/supabase/types.ts` : types générés automatiquement depuis le schéma public.
2. `src/integrations/supabase/types.extended.ts` : extension locale qui ajoute ou surcharge des colonnes / tables supplémentaires non (encore) présentes dans la génération CLI ou nécessitant un enrichissement.

Les tables ajoutées récemment via extension :
- `credits_wallets`
- `credits_ledger`
- `trajet_join_requests`

> Lorsque la génération officielle inclura ces tables, vous pourrez retirer leur redéfinition de `types.extended.ts` (ou les conserver si vous appliquez toujours une surcharge).

---
## 1. Générer les types officiels
Assurez-vous d'avoir la CLI Supabase installée :
```bash
supabase --version
```
Connexion (si nécessaire) :
```bash
supabase login
```
Commande de génération (remplace le fichier de base) :
```bash
supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/integrations/supabase/types.ts
```
Où `<PROJECT_ID>` est l'ID de votre projet (visible dans le dashboard Supabase ou la config). 

Validez ensuite par :
```bash
npx tsc --noEmit
```

---
## 2. Ne pas écraser l'extension
`types.extended.ts` NE DOIT PAS être écrasé. Il fusionne les types base avec :
- Ajout de colonnes optionnelles
- Tables de travail / expérimentales

Si vous régénérez `types.ts`, aucune action n'est nécessaire dans `types.extended.ts` tant que la surface des noms n'entre pas en conflit. Les merges se font par clef.

---
## 3. Migration pour retirer une table de l'extension
Quand une table (ex: `credits_wallets`) apparaît enfin dans la génération officielle :
1. Supprimez sa définition de la section `Tables:` dans `types.extended.ts`.
2. Lancez `npx tsc --noEmit` pour vérifier qu'il n'y a plus de références manquantes.
3. Commit.

Astuce : faire ce retrait table par table pour minimiser le bruit.

---
## 4. Ajout d'une nouvelle table custom
1. Créez la migration SQL sous `supabase/migrations/`.
2. Appliquez la migration sur l'instance Supabase.
3. (Optionnel) Générez les types officiels pour voir si la table y apparaît déjà.
4. Si absente ou incomplète : ajoutez-la dans `types.extended.ts` (structure Row/Insert/Update/Relationships).
5. Typecheck.

---
## 5. Stratégie en environnements CI/CD
Vous pouvez automatiser une vérification que la génération actuelle correspond au schéma :
```bash
supabase gen types typescript --project-id <PROJECT_ID> --schema public > tmp.types.ts
# comparer diff avec src/integrations/supabase/types.ts
```
Si diff significatif : avertir / échouer la build pour forcer une mise à jour.

---
## 6. Bonnes pratiques
- Toujours lancer `npx tsc --noEmit` après modification des types.
- Préférer des types explicites (`Database['public']['Tables']['credits_wallets']['Row']`) dans le code plutôt que recréer des interfaces.
- Éviter les shims `any` (`tbl()`) désormais retirés.
- Documenter dans la PR quand une table est retirée de l'extension ("table adoptée par génération officielle").

---
## 7. Questions fréquentes
**Q: Pourquoi ne pas tout mettre directement dans `types.ts` ?**  
Parce qu'il est régénéré et serait écrasé. L'extension sépare votre logique durable de la sortie CLI.

**Q: Que faire si une colonne ajoutée localement arrive avec un nom différent dans le schéma final ?**  
Retirer l'override, adapter le code d'accès, revalider par typecheck, puis supprimer tout commentaire obsolète.

---
_MàJ initiale : ajout crédits & demandes trajets (2025-09)._