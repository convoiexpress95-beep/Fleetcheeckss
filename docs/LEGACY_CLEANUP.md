# Legacy Code & Dossiers Doublons

Ce document trace l'inventaire des sous-projets / répertoires legacy présents dans le repo et propose un plan de nettoyage progressif sécurisé.

## 1. Inventaire des dossiers identifiés

| Dossier | Rôle historique supposé | État actuel | Import direct détecté | Action proposée |
|---------|--------------------------|-------------|------------------------|-----------------|
| `covoiturage-bleu-sorcier-main/` | Prototype / fork module covoiturage autonome | Non référencé dans le code applicatif principal (seulement mention commentaires + scripts install) | Non (aucun `import` vers ce chemin) | Marquer pour suppression après 1 sprint de validation |
| `market-app/` (ex `Market/`) | Mini-app marketplace autonome (dossier racine) | Isolé, pas d'import direct dans app principale | Non (servi via iframe / external) | Conserver isolé, clarifier rôle dans doc |
| `marketss/` | Copie / variante marketplace (probablement temporaire) | Aucune référence import | Non | Candidat suppression immédiate |
| `app-syncer/` | Ancienne racine du projet / duplication structure | Proxy interne (`app-syncer/src/App.tsx` loggue avertissement), duplication quasi complète | Indirect (tsconfig paths excluent?) | Plan de retrait progressif, garder seulement fichiers indispensables si build externe dépend |

## 2. Références relevées

- `tsconfig.json` paths/excludes contiennent :
  - `"Market/**"`, `"covoiturage-bleu-sorcier-main/**"`, `"marketss/**"`
- `package.json` script : `install:embeds` installe `./Market` et `./covoiturage-bleu-sorcier-main`.
- `src/pages/FleetMarket.tsx` et `src/pages/MarketplaceMessages.tsx` : imports `@/market/components/...` (alias probable vers `Market/`).
- Aucun import vers `marketss/` ou `covoiturage-bleu-sorcier-main/`.
- Fichier `ConvoiturageLovable.tsx` : seulement commentaire référant l'ancien sous-projet.

## 3. Risques avant suppression

| Risque | Description | Mitigation |
|--------|-------------|------------|
| Build scripts/scripts CI | `install:embeds` échouera si dossier supprimé | Mettre à jour script ou le retirer |
| Documentation obsolète | Références README pointant vers legacy | Chercher/mettre à jour après suppression |
| Régression fonctionnelle cachée | Une page encore servie via iframe local | Lister routes /embeds/ utilisées réellement (logs / analytics) |

## 4. Plan de nettoyage progressif

1. Étape A (rapide – prochaine PR)
   - Supprimer `marketss/` (aucun import). ✅ (FAIT le 2025-09-18)
   - Archiver son diff (zip) dans `ARCHIVE.md` (référence commit) si besoin.
2. Étape B (FAIT le 2025-09-18)
   - Supprimer `covoiturage-bleu-sorcier-main/` après confirmation que la version intégrée actuelle couvre les besoins (valider absence d’iframe directe). ✅ (dossier supprimé)
   - Retirer partie correspondante du script `install:embeds`. ✅ (scripts embeds totalement supprimés de `package.json` le 2025-09-18)
3. Étape C (FAIT le 2025-09-18)
   - Suppression complète de `app-syncer/` (aucun outil externe ne le ciblait, duplication confirmée).
   - Retrait de l'exclusion `app-syncer/**` dans `tsconfig.json` et `tsconfig.app.json`.
   - Ajout instrumentation générique DB (`src/lib/dbTracer.ts`, variable `VITE_DEBUG_DB`).

### Détail Étape C (pré-exécution)

| Élément | Type | Action prévue | Justification |
|---------|------|---------------|---------------|
| `app-syncer/src/App.tsx` | Proxy React | Supprimer | Duplication + simple console.warn |
| `app-syncer/src/main.tsx` | Bootstrap legacy | Supprimer | Montage parallèle inutile |
| `app-syncer/src/hooks/index.ts` | Agrégateur | Supprimer | Redondant avec `src/hooks` racine |
| Autres fichiers config (si présents) | Config | Supprimer | Plus aucun script ne s’y réfère |
| Exclusion `app-syncer/**` (tsconfig) | Config TS | Retirer | Réduction bruit indexation |
| Entrée doc (inventaire) | Documentation | Mettre à jour | Marquer PR3 complétée |

Stratégie: suppression atomique (un commit) puis validation build. Si réapparition d’un besoin, récupérer depuis l’historique Git.
4. Étape D (FAIT le 2025-09-18)
   - Renommage du dossier interne `src/market` -> `src/market-embed` et mise à jour des imports (`@/market-embed/...`).
   - Renommage du dossier racine `Market/` -> `market-app/` (usage autonome conservé, exclusion TS maintenue).
   - Mise à jour de l'exclusion `Market/**` -> `market-app/**` dans `tsconfig.json`.

## 5. Checklist suppression (à répéter pour chaque dossier)

- [ ] Rechercher imports (`grep "<dossier>/"`).
- [ ] Rechercher alias tsconfig.
- [ ] Vérifier scripts npm.
- [ ] Construire build local (vite) + smoke test pages clés.
- [ ] Commit suppression isolée avec message explicite.
- [ ] Mettre à jour doc (ce fichier + README si mention).

## 6. Proposition de PRs séquencées

| PR | Contenu | Objet |
|----|---------|-------|
| PR1 | Suppression `marketss/` + update doc | Nettoyage initial sans risque |
| PR2 | Suppression `covoiturage-bleu-sorcier-main/` + update script | Réduction duplication covoiturage | ✅ (2025-09-18)
| PR3 | Suppression `app-syncer/` + cleanup tsconfig + dbTracer | Simplification racine + observabilité |
| PR4 | Renommage `src/market` -> `src/market-embed` + `Market/` -> `market-app/` | Clarification rôles (embed vs app autonome) |

## 7. Indicateurs de succès
- Réduction du temps d'indexation TypeScript / IntelliSense.
- Moins de faux positifs ESLint/TS issus des dossiers non maintenus.
- Lisibilité améliorée de la racine du repo.

## 8. Actions automatiques suggérées (facultatif)
- Ajouter un script `npm run audit:legacy` qui émet un avertissement si dossiers legacy réapparaissent.

## 9. Prochaines actions immédiates (si validé)
1. (FAIT) Lancer PR1 (suppression `marketss/`).
2. (FAIT) Vérifier qu’aucun asset critique n’est uniquement dans `covoiturage-bleu-sorcier-main/`.
3. Préparer un alias explicite pour `market` dans `tsconfig.paths` si renommage futur.

## 10. Historique des suppressions

| Date | Action | Commit |
|------|--------|--------|
| 2025-09-18 | Suppression dossier `marketss/` (aucune référence active, étape A complétée) | (à renseigner après merge) |
| 2025-09-18 | Suppression dossier `covoiturage-bleu-sorcier-main/` (Étape B complétée) | (à renseigner après merge) |
| 2025-09-18 | Suppression des scripts embeds (`install:embeds`, `build:embeds:*`, `embed:prepare`, `embed:copy`) | (à renseigner après merge) |
| 2025-09-18 | Suppression dossier `app-syncer/` + retrait exclusions TS + ajout `dbTracer` | (à renseigner après merge) |
| 2025-09-18 | Renommage `src/market` -> `src/market-embed` + `Market/` -> `market-app/` (Étape D) | (à renseigner après merge) |


---
Document généré automatiquement – ajuster selon décisions produit/tech.
