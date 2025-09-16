import React from 'react';

// Page d’embed de l’interface Convoiturage (sous-projet covoiturage-bleu-sorcier-main)
// Par défaut, on sert le build statique sous /embeds/convoiturage même en dev.
// Pour cibler un serveur externe en dev, définissez VITE_USE_EXTERNAL_CONVOITURAGE=true + VITE_CONVOITURAGE_URL
const USE_EXTERNAL_CONV = String(import.meta.env.VITE_USE_EXTERNAL_CONVOITURAGE || '').toLowerCase() === 'true';
const CONV_HASH = String(import.meta.env.VITE_CONVOITURAGE_HASH_PATH || '#/');
const CONVOITURAGE_URL = (import.meta.env.DEV && USE_EXTERNAL_CONV && import.meta.env.VITE_CONVOITURAGE_URL)
  ? String(import.meta.env.VITE_CONVOITURAGE_URL)
  : `/embeds/convoiturage/index.html${CONV_HASH.startsWith('#') ? '' : '#'}${CONV_HASH.replace(/^#/, '')}`;

export default function ConvoiturageLovable(){
  return (
    <div className="h-[calc(100vh-64px)] w-full p-4">
      <div className="h-full w-full rounded-lg border border-border overflow-hidden bg-background">
        <iframe
          title="Convoiturage App Preview"
          src={String(CONVOITURAGE_URL)}
          className="h-full w-full"
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
  Si la page est vide, exécutez "npm run dev:single" (ou "npm run build:all"). Pour tester un serveur externe en dev, définissez VITE_USE_EXTERNAL_CONVOITURAGE=true.
      </div>
    </div>
  );
}
