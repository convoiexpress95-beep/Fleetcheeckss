import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperLightTheme, MD3Theme as PaperTheme } from 'react-native-paper';

export const colors = {
	background: '#0b1020',
	surface: 'rgba(255,255,255,0.08)',
	surfaceBorder: 'rgba(255,255,255,0.12)',
	text: '#ffffff',
	textMuted: 'rgba(255,255,255,0.7)',
	primary: '#2563eb',
	secondary: '#7c3aed',
	accent: '#f97316',
	headerBg: '#0b1020',
	tabBg: '#0b1020',
	tabBorder: '#1f2937',
};

// Alias rétrocompatibilité
export const tokens = colors;

export const navigationTheme: NavigationTheme = {
	...NavigationDarkTheme,
	colors: {
		...NavigationDarkTheme.colors,
		background: colors.background,
		card: colors.headerBg,
		primary: colors.primary,
		text: colors.text,
		border: colors.tabBorder,
		notification: colors.accent,
	},
};

export const paperTheme: PaperTheme = {
	...PaperDarkTheme,
	colors: {
		...PaperDarkTheme.colors,
		background: colors.background,
		surface: colors.surface,
		primary: colors.primary,
		secondary: colors.secondary as any,
		onSurface: colors.text,
	},
};

// Variantes claires
export const colorsLight = {
	background: '#ffffff',
	surface: '#ffffff',
	surfaceBorder: '#e5e7eb',
	text: '#111827',
	textMuted: '#6b7280',
	primary: '#2563eb',
	secondary: '#7c3aed',
	accent: '#0ea5e9',
	headerBg: '#ffffff',
	tabBg: '#ffffff',
	tabBorder: '#e5e7eb',
};

export const navigationThemeLight: NavigationTheme = {
	...NavigationLightTheme,
	colors: {
		...NavigationLightTheme.colors,
		background: colorsLight.background,
		card: colorsLight.headerBg,
		primary: colorsLight.primary,
		text: colorsLight.text,
		border: colorsLight.tabBorder,
		notification: colorsLight.accent,
	},
};

export const paperThemeLight: PaperTheme = {
	...PaperLightTheme,
	colors: {
		...PaperLightTheme.colors,
		background: colorsLight.background,
		surface: colorsLight.surface,
		primary: colorsLight.primary,
		secondary: colorsLight.secondary as any,
		onSurface: colorsLight.text,
	},
};

