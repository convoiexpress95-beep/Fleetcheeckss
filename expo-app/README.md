# Expo App Skeleton

## Installation
```bash
npm install
```

## D�marrage
```bash
npm run web
```

## Variables d'environnement
Copier `.env.example` vers `.env` puis renseigner:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Structure
- `App.tsx`: point d'entr�e + Auth gating
- `src/navigation/RootNavigator.tsx`: navigation (tabs + stacks)
- `src/screens/screens.tsx`: placeholders domaines
- `src/lib/supabase.ts`: client Supabase
- `src/lib/auth.tsx`: contexte session

## Prochaines �tapes
- �cran de connexion r�el
- �tats de chargement styl�s
- Int�gration donn�es r�elles
