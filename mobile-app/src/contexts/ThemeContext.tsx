import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  navigationTheme as navigationDark,
  paperTheme as paperDark,
  colors as colorsDark,
  navigationThemeLight,
  paperThemeLight,
  colorsLight,
} from '../theme';

type Mode = 'light' | 'dark';

type ThemeContextValue = {
  // mode effectif appliqué à l'app
  mode: Mode;
  // préférence manuelle (utilisée quand auto = false)
  prefMode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
  // planificateur automatique nuit (20h) / jour (8h)
  auto: boolean;
  setAuto: (v: boolean) => void;
  toggleAuto: () => void;
  // thèmes/couleurs dérivés
  colors: typeof colorsDark;
  paperTheme: typeof paperDark;
  navigationTheme: typeof navigationDark;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme:mode';
const STORAGE_AUTO = 'theme:auto';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefMode, setPrefMode] = useState<Mode>('dark'); // activé par défaut
  const [auto, setAutoState] = useState<boolean>(true); // auto activé par défaut selon la demande
  const [mode, setMode] = useState<Mode>('dark'); // mode effectif
  const [ready, setReady] = useState(false);

  // calcule si on est dans la plage nuit
  const computeIsNight = () => {
    const now = new Date();
    const h = now.getHours();
    return h >= 20 || h < 8; // 20h-08h
  };

  const applyEffectiveMode = (autoFlag: boolean, pref: Mode) => {
    const next = autoFlag ? (computeIsNight() ? 'dark' : 'light') : pref;
    setMode(next);
  };

  // charge préférences
  useEffect(() => {
    (async () => {
      try {
        const [savedMode, savedAuto] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(STORAGE_AUTO),
        ]);
        if (savedMode === 'light' || savedMode === 'dark') setPrefMode(savedMode);
        if (savedAuto === 'true' || savedAuto === 'false') setAutoState(savedAuto === 'true');
      } catch {}
      setReady(true);
    })();
  }, []);

  // applique le mode effectif dès que ready, auto ou pref changent
  useEffect(() => {
    if (!ready) return;
    applyEffectiveMode(auto, prefMode);
  }, [ready, auto, prefMode]);

  // planifie le prochain basculement en mode auto
  useEffect(() => {
    if (!auto) return;
    // calcule délai jusqu'à 08:00 ou 20:00 suivant
    const now = new Date();
    const isNight = computeIsNight();
    const target = new Date(now);
    if (isNight) {
      // prochaine bascule à 08:00 demain si après minuit sinon aujourd'hui 08:00 si avant
      target.setHours(8, 0, 0, 0);
      if (now.getHours() >= 8 && now.getHours() < 20) {
        // impossible ici car isNight false dans ce cas
      }
      if (now >= target) target.setDate(target.getDate() + 1);
    } else {
      // prochaine bascule à 20:00 aujourd'hui
      target.setHours(20, 0, 0, 0);
      if (now >= target) target.setDate(target.getDate() + 1);
    }
    const delay = Math.max(1000, target.getTime() - now.getTime());
    const t = setTimeout(() => applyEffectiveMode(true, prefMode), delay);
    return () => clearTimeout(t);
  }, [auto, prefMode, mode]);

  const persist = async (m: Mode) => {
    setPrefMode(m);
    try { await AsyncStorage.setItem(STORAGE_KEY, m); } catch {}
  };

  const toggle = () => persist((prefMode === 'dark' ? 'light' : 'dark'));

  const setAuto = async (v: boolean) => {
    setAutoState(v);
    try { await AsyncStorage.setItem(STORAGE_AUTO, String(v)); } catch {}
  };
  const toggleAuto = () => setAuto(!auto);

  const value: ThemeContextValue = useMemo(() => {
    const isDark = mode === 'dark';
    return {
      mode,
      prefMode,
      setMode: persist,
      toggle,
      auto,
      setAuto,
      toggleAuto,
      colors: isDark ? colorsDark : colorsLight,
      paperTheme: isDark ? paperDark : paperThemeLight,
      navigationTheme: isDark ? navigationDark : navigationThemeLight,
      ready,
    };
  }, [mode, prefMode, auto, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
};
