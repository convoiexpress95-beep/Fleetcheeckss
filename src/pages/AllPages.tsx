import React from 'react';
import { Link } from 'react-router-dom';

interface PageMeta { name: string; path: string; note?: string; }

// Mapping des vraies routes déclarées dans App.tsx (évite 404)
const routeMap: PageMeta[] = [
  { name: 'Dashboard', path: '/' },
  { name: 'Landing', path: '/landing' },
  { name: 'Login', path: '/login' },
  { name: 'PublicTracking', path: '/public-tracking/:token', note: 'paramétrée' },
  { name: 'Contacts', path: '/gestionnaire-missions/contacts' },
  { name: 'Reports', path: '/gestionnaire-missions/rapports' },
  { name: 'Tracking (GPS)', path: '/tracking' },
  { name: 'Shop', path: '/shop' },
  { name: 'Catalog', path: '/catalog' },
  { name: 'Billing', path: '/billing' },
  { name: 'Settings', path: '/settings' },
  { name: 'Verification', path: '/verification' },
  { name: 'Onboarding', path: '/onboarding' },
  { name: 'Messages', path: '/messages' },
  { name: 'Admin', path: '/admin' },
  { name: 'InspectionWizard', path: '/inspection' },
  { name: 'Profile', path: '/profile/:id', note: 'paramétrée' },
  { name: 'Pages (alias)', path: '/pages', note: 'alias _pages' },
];

const pages = routeMap;

// Génère une valeur d'exemple par nom de param
function sampleValue(param: string) {
  switch(param){
    case 'id': return '123';
    case 'token': return 'demo-token';
    default: return 'demo';
  }
}

function resolvePath(path: string){
  // Remplace chaque segment paramétré individuellement tout en conservant le suffixe (ex: /missions/:id/edit)
  return path.split('/').map(seg => seg.startsWith(':') ? sampleValue(seg.slice(1)) : seg).join('/');
}

export default function AllPages(){
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Routes disponibles ({pages.length})</h1>
      <div className="grid md:grid-cols-3 gap-3">
        {pages.map(p=> {
          const to = resolvePath(p.path);
          const isParam = p.path.includes(':');
          return (
            <Link key={p.path} to={to} className="group rounded-lg border border-border/50 p-4 hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-sm">{p.name}</span>
                {isParam && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">param</span>}
              </div>
              <div className="text-xs text-muted-foreground group-hover:text-foreground break-all leading-relaxed">
                <div><span className="text-foreground/70">Déclaré: </span>{p.path}</div>
                {isParam && <div><span className="text-foreground/70">Exemple: </span>{to}</div>}
              </div>
              {p.note && <div className="mt-1 text-[10px] uppercase tracking-wide text-amber-500">{p.note}</div>}
            </Link>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-muted-foreground space-y-1">
        <span className="block">Liste construite à partir de la config réelle des routes (App.tsx).</span>
  <span className="block">Les routes paramétrées sont résolues sans couper les segments suffixes.</span>
      </p>
    </div>
  );
}
