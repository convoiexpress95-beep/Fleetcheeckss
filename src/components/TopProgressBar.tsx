import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * TopProgressBar
 * Affiche une fine barre en haut lors des transitions de route ou requêtes réseau (react-query).
 */
export function TopProgressBar(){
  const isFetching = useIsFetching();
  const location = useLocation();
  const navType = useNavigationType();
  const [visible, setVisible] = useState(false);
  const hideTimeout = useRef<number | null>(null);

  // Montre lors d'une navigation (sauf POP rapide) puis cache après léger délai.
  useEffect(()=>{
    if(navType !== 'POP') {
      setVisible(true);
      if(hideTimeout.current) window.clearTimeout(hideTimeout.current);
      hideTimeout.current = window.setTimeout(()=> setVisible(false), 900);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Requêtes réseau -> visible tant qu'il y en a
  useEffect(()=>{
    if(isFetching>0){
      setVisible(true);
    } else {
      if(hideTimeout.current) window.clearTimeout(hideTimeout.current);
      hideTimeout.current = window.setTimeout(()=> setVisible(false), 350);
    }
  },[isFetching]);

  return visible ? <div className="top-progress-bar" aria-label="Chargement" /> : null;
}
