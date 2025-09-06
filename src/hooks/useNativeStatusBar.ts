import { useEffect, useMemo } from 'react';

export const useNativeStatusBar = () => {
  const isNative = useMemo(() => {
    try {
      // @ts-ignore - optional at runtime
      const { Capacitor } = require('@capacitor/core');
      return !!Capacitor?.isNativePlatform?.() && Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }, []);

  const setStatusBarStyle = async (style: 'light' | 'dark' = 'dark') => {
    if (!isNative) return;

    try {
      const modPath = '@capacitor/status-bar';
      // @ts-ignore
      const { StatusBar, Style } = await import(/* @vite-ignore */ modPath);
      await StatusBar.setStyle({
        style: style === 'dark' ? Style.Dark : Style.Light,
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  };

  const setStatusBarColor = async (color: string = '#2563eb') => {
    if (!isNative) return;

    try {
      const modPath = '@capacitor/status-bar';
      // @ts-ignore
      const { StatusBar } = await import(/* @vite-ignore */ modPath);
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  };

  const hideStatusBar = async () => {
    if (!isNative) return;

    try {
      const modPath = '@capacitor/status-bar';
      // @ts-ignore
      const { StatusBar } = await import(/* @vite-ignore */ modPath);
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  };

  const showStatusBar = async () => {
    if (!isNative) return;

    try {
      const modPath = '@capacitor/status-bar';
      // @ts-ignore
      const { StatusBar } = await import(/* @vite-ignore */ modPath);
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  };

  // Configuration par défaut
  useEffect(() => {
    if (isNative) {
      setStatusBarStyle('dark');
      setStatusBarColor('#2563eb');
    }
  }, [isNative]);

  return {
    isNative,
    setStatusBarStyle,
    setStatusBarColor,
    hideStatusBar,
    showStatusBar,
  };
};