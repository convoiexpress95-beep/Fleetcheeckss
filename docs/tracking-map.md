# Carte de suivi (Mapbox)

Cette page explique comment afficher la carte Mapbox sur la page de suivi public (`/public-tracking/:token`) et dans le dashboard si vous utilisez le composant `MapboxMap`.

## Prérequis
- Un compte Mapbox
- Un token public (type `pk.`) — ne pas utiliser de token secret `sk.` côté navigateur.

## Configuration locale (Vite)
1. À la racine du projet, créez un fichier `.env` (ou mettez à jour s’il existe déjà) :

```
VITE_MAPBOX_TOKEN=pk_your_public_token_here
```

2. Redémarrez le serveur de dev pour que Vite recharge les variables:

```
npm run dev
```

3. Ouvrez la page de suivi public et vérifiez que la carte s’affiche.

## Proxy Mapbox (optionnel en dev)
Le projet expose un proxy `/mapbox` côté Vite. Pour l’utiliser, vous pouvez ajouter dans `.env` :

```
VITE_USE_MAPBOX_PROXY=1
```

Puis appeler les APIs via `/mapbox/...` plutôt que `https://api.mapbox.com/...` (déjà utilisé par certains composants).

## Production (Vercel)
1. Dans votre projet Vercel, ajoutez la variable d’environnement :
   - Key: `VITE_MAPBOX_TOKEN`
   - Value: `pk_your_public_token_here`
   - Environnements: Preview + Production
2. Redeployez l’application.

## Dépannage
- "Aucun token Mapbox détecté": définissez `VITE_MAPBOX_TOKEN`.
- "Token Mapbox invalide": le token doit commencer par `pk.` (public). Les tokens `sk_` ne sont pas valides côté navigateur.
- La carte reste vide: vérifiez la console navigateur pour d’éventuelles erreurs CORS ou de style Mapbox.
- Assurez-vous d’avoir importé `import 'mapbox-gl/dist/mapbox-gl.css'` (déjà présent dans `MapboxMap.tsx`).
