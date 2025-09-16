# Missions Modern Embed

Build autonome de l'interface moderne des missions. Généré sous `public/embeds/missions-modern` pour intégration via iframe.

## Build

npm --prefix ./missions-modern install
npm run build:embeds:missions-modern (script ajouté au root) ou inclusion via build:all après update.

Entrypoint: `/src/main-embed.tsx` qui monte uniquement la page `Missions` avec providers essentiels.
