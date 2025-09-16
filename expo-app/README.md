# Expo App Skeleton

## Installation
```bash
npm install
```

## Démarrage
```bash
npm run web
```

## Variables d'environnement
Copier `.env.example` vers `.env` puis renseigner:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Structure
- `App.tsx`: point d'entrée + Auth gating
- `src/navigation/RootNavigator.tsx`: navigation (tabs + stacks)
- `src/screens/screens.tsx`: placeholders domaines
- `src/lib/supabase.ts`: client Supabase
- `src/lib/auth.tsx`: contexte session

## Prochaines étapes
- Écran de connexion réel
- États de chargement stylés
- Intégration données réelles
