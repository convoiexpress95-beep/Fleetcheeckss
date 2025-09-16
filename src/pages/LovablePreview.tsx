import React from 'react';

// Permet d'afficher l'interface Lovable (projet Market) via un iframe
// Par défaut, on sert le build statique sous /embeds/market même en dev.
// Pour cibler un serveur externe en dev, définissez VITE_USE_EXTERNAL_LOVABLE=true + VITE_LOVABLE_URL
const USE_EXTERNAL = String(import.meta.env.VITE_USE_EXTERNAL_LOVABLE || '').toLowerCase() === 'true';
const MARKET_HASH = String(import.meta.env.VITE_MARKET_HASH_PATH || '#/');
const LOVABLE_URL = (import.meta.env.DEV && USE_EXTERNAL && import.meta.env.VITE_LOVABLE_URL)
  ? String(import.meta.env.VITE_LOVABLE_URL)
  : `/embeds/market/index.html${MARKET_HASH.startsWith('#') ? '' : '#'}${MARKET_HASH.replace(/^#/, '')}`;

export default function LovablePreview(){
  return (
    <div className="h-[calc(100vh-64px)] w-full p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Marketplace (Lovable)</div>
        <a
          href={String(LOVABLE_URL).includes('#') ? String(LOVABLE_URL) : `${String(LOVABLE_URL)}${MARKET_HASH.startsWith('#') ? '' : '#'}${MARKET_HASH.replace(/^#/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Ouvrir dans un nouvel onglet
        </a>
      </div>
      <div className="h-[calc(100%-1.75rem)] w-full rounded-lg border border-border overflow-hidden bg-background">
        <iframe
          title="Lovable App Preview"
          src={String(LOVABLE_URL)}
          className="h-full w-full"
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
  Si la page est vide, exécutez "npm run dev:single" (ou "npm run build:all"). Pour tester un serveur externe en dev, définissez VITE_USE_EXTERNAL_LOVABLE=true.
      </div>
    </div>
  );
}
