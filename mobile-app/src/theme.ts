import type { MD3Theme } from 'react-native-paper';
import { MD3DarkTheme } from 'react-native-paper';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Tokens alignés sur src/index.css (web)
export const tokens = {
  radius: 12, // ~0.75rem
  colors: {
    background: '#06090f', // hsl(220,30%,3%) approx
    card: '#0a0f17',       // hsl(220,25%,4%) approx
    surface: '#0a0f17',
    onSurface: '#e6fffe',  // hsl(180,100%,98%) approx
    primary: '#00ffff',    // hsl(180,100%,50%)
    onPrimary: '#051013',  // proche du fond sombre
    accent: '#00c8ff',     // hsl(195,100%,45%) approx
    border: '#111827',     // proche hsl(240,3.7%,8%)
  }
};

export const paperTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: tokens.radius,
  colors: {
    ...MD3DarkTheme.colors,
    primary: tokens.colors.primary,
    secondary: tokens.colors.accent,
    background: tokens.colors.background,
    surface: tokens.colors.surface,
    surfaceVariant: tokens.colors.card,
    onSurface: tokens.colors.onSurface,
    onPrimary: tokens.colors.onPrimary,
    outline: tokens.colors.border,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    // Les fontes réelles seront mappées après chargement dans App.tsx via PaperProvider
  },
};

export const navTheme: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: tokens.colors.primary,
    background: tokens.colors.background,
    card: tokens.colors.card,
    text: tokens.colors.onSurface,
    border: tokens.colors.border,
    notification: tokens.colors.accent,
  },
};

export default { paperTheme, navTheme, tokens };
