import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteProbeProps {
  patterns: string[];
}

// Active si ?rp=1 dans l'URL ou localStorage.routeProbe === '1'
export const RouteProbe: React.FC<RouteProbeProps> = ({ patterns }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const search = location.search;

  useEffect(()=>{
    const q = new URLSearchParams(search);
    if(q.get('rp') === '1' || localStorage.getItem('routeProbe') === '1'){
      setVisible(true);
    }
  }, [search]);

  const match = useMemo(()=>{
    const path = location.pathname;
    for(const p of patterns){
      const rx = new RegExp('^' + p.replace(/:\w+/g,'[^/]+') + '$');
      if(rx.test(path)) return p;
    }
    return null;
  }, [location.pathname, patterns]);

  useEffect(()=>{
    if(!visible) return;
    // Log détaillé
    console.group('[RouteProbe]');
    console.log('Path courant:', location.pathname + location.search);
    console.log('Correspondance trouvée:', match || 'Aucune');
    if(!match){
      console.log('Patterns connus:', patterns);
      if(location.pathname.startsWith('/cleartrip')){
        console.warn('Le chemin commence par /cleartrip mais aucune correspondance. Vérifier que ce build est bien le bundle principal.');
      }
    }
    console.groupEnd();
  }, [location.pathname, match, visible, patterns]);

  if(!visible) return null;

  return (
    <div style={{position:'fixed', bottom:8, right:8, zIndex:9999}}>
      <div className="rounded-md shadow border border-border/50 bg-background/90 backdrop-blur px-3 py-2 text-xs space-y-1 max-w-[280px]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold">RouteProbe</span>
          <button onClick={()=>setVisible(false)} className="text-foreground/70 hover:text-foreground">×</button>
        </div>
        <div><span className="text-foreground/60">Path:</span> {location.pathname}</div>
        <div><span className="text-foreground/60">Match:</span> {match || <span className="text-destructive font-medium">AUCUN</span>}</div>
        {!match && (
          <div className="text-[10px] leading-relaxed text-foreground/70">
            Aucune route correspondante. Si vous attendiez /cleartrip/missions assurez-vous que le serveur lancé est <strong>le bundle principal (src/App.tsx)</strong> et pas un sous-projet.
          </div>
        )}
        <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-auto">
          {patterns.slice(0,30).map(p=> (
            <span key={p} className={`px-1.5 py-0.5 rounded border text-[10px] ${p===match? 'bg-primary/20 border-primary text-primary':'bg-muted/60 border-border/40'}`}>{p}</span>
          ))}
        </div>
        <div className="text-[9px] text-muted-foreground pt-1 border-t border-border/30">Paramètre rp=1 pour afficher automatiquement.</div>
      </div>
    </div>
  );
};

export default RouteProbe;
