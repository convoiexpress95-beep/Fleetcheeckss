import type React from "react";
// Centralise les URLs du logo (local + fallback distant)
export const BRAND_NAME = "FleetChecks";
// Utilise directement le logo distant pour le web (remplace l'ancien /branding/logo.png)
export const BRAND_LOGO_LOCAL = "https://i.ibb.co/xqf1LCDC/Chat-GPT-Image-6-sept-2025-01-04-56.png";
export const BRAND_LOGO_REMOTE = "https://i.ibb.co/xqf1LCDC/Chat-GPT-Image-6-sept-2025-01-04-56.png";

// Petite aide pour gérer l'erreur de chargement <img> côté React
export function withLogoFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = BRAND_LOGO_REMOTE
) {
  const img = e.currentTarget;
  if (img && img.src !== fallback) {
    img.src = fallback;
  }
}
