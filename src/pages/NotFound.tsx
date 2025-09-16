import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
// Fallback urgent: import direct pourcer rendu de la vue moderne si le routing principal échoue
// Routes missions supprimées

const NotFound = () => {
  const location = useLocation();

  // Si l'URL contient "fleetmarket" ou "marketplace" mais n'a pas matché, on n'affiche plus de page interne.
  const normalized = location.pathname
    .toLowerCase()
    .replace(/\s+/g,'')
    .replace(/\/+$/,'')
    .replace(/\/\/+/, '/');

  // Si la forme normalisée diffère et correspond à une route connue → rediriger proprement.
  if (typeof window !== 'undefined') {
    const routes: string[] = (window as any).__APP_ROUTES__ || [];
    if (location.pathname !== normalized && routes.includes(normalized)) {
      return <Navigate to={normalized + location.search} replace />;
    }
  }

  // Laisser passer silencieusement les ressources statiques des embeds
  if (normalized.startsWith('/embeds/market') || normalized.startsWith('/embeds/convoiturage')) {
    return <div className="hidden" />;
  }
  if ((normalized.includes('fleetmarket') || normalized.includes('marketplace'))) {
    // L'accès se fait depuis la top bar en nouvel onglet → renvoyer vers l'accueil
    return <Navigate to="/" replace />;
  }
  // Redirections des routes "simples" de la mini-app Convoiturage quand elles arrivent au niveau racine.
  // Exemple: /publish, /my-trips, /messages, /profile, /trip/:id
  const convSimple = new Set(['/publish','/my-trips','/messages','/profile']);
  if (convSimple.has(normalized)) {
    return <Navigate to="/" replace />;
  }
  if (/^\/trip\/.+/.test(normalized)) {
    return <Navigate to="/" replace />;
  }
  // Convoiturage n'a plus de rendu interne, on renvoie vers l'accueil
  if (normalized === '/convoiturage') {
    return <Navigate to="/" replace />;
  }

  // /fleetmarket n'a plus de page interne

  useEffect(() => {
    const p = location.pathname;
    if (import.meta.env.DEV) {
      // Log des codes caractères pour détecter espaces ou caractères invisibles
      console.debug('[NotFound] path debug', p, p.split('').map(c => c.charCodeAt(0)));
    }

    // Vérifie si la route est réellement inconnue vis-à-vis de la liste exposée par instrumentation.
    const routePatterns: string[] = (window as any).__APP_ROUTES__ || [];
    const toRegex = (pattern: string) => {
      // échappe les / . ? + ^ $ etc sauf * et :param
      const esc = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
        .replace(/:(\w+)/g, '[^/]+') // :id → segment
        .replace(/\*/g, '.*'); // wildcard
      return new RegExp('^' + esc + '$');
    };
    let matchesKnown = false;
    if (Array.isArray(routePatterns) && routePatterns.length) {
      matchesKnown = routePatterns.some(r => {
        try {
          const ok = toRegex(r).test(p);
          if (import.meta.env.DEV && ok) console.debug('[NotFound] pattern match', { pattern: r, path: p });
          return ok;
        } catch (e) {
          return false;
        }
      });
    }


    if (!p.startsWith('/embeds/') && p !== '/fleetmarket' && p !== '/marketplace') {
      if (!matchesKnown) {
        // Délai court: parfois le composant NotFound se monte avant que Router n'hydrate le bon élément protégé (auth async)
        let cancelled = false;
        const t = setTimeout(() => {
          if (!cancelled) {
            console.error('404 Error: User attempted to access non-existent route:', p);
          }
        }, 120); // 120ms heuristique
        return () => { cancelled = true; clearTimeout(t); };
      } else if (import.meta.env.DEV) {
        console.info('[NotFound] Faux positif évité: le chemin correspond à un pattern connu', p);
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

