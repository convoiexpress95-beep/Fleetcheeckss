import { createRoot, Root } from 'react-dom/client'
import React from 'react'
import App from './App.tsx'
import './index.css'

const rootEl = document.getElementById('root')!;
const w = window as unknown as { __FC_ROOT?: Root };
// Indicateur bundle principal
(window as any).__BUNDLE_ID__ = 'main-app';
// Réutilise la même instance de root entre les rechargements HMR
const root = w.__FC_ROOT ?? createRoot(rootEl);
w.__FC_ROOT = root;

if (import.meta.env.DEV) {
	// En dev, rendre sans StrictMode pour éviter les double-mount HMR qui
	// exacerbent certains problèmes de portails/DOM avec Chrome.
	root.render(<App />);
} else {
	// En prod: prendre le contrôle des anciens Service Workers (migration anti-page blanche Chrome)
	if ('serviceWorker' in navigator) {
		// Enregistrer notre SW minimal pour remplacer d'éventuels anciens SW de cache
		navigator.serviceWorker.register('/sw.js', { scope: '/' })
			.then(async (reg) => {
				try {
					// Nettoyer d'éventuels autres enregistrements obsolètes
					const regs = await navigator.serviceWorker.getRegistrations();
					for (const r of regs) {
						const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL;
						if (url && new URL(url).pathname !== '/sw.js') {
							await r.unregister();
						}
					}
				} catch (e) {
					console.warn('[SW] Cleanup failed', e);
				}
			})
			.catch((e) => console.warn('[SW] Registration failed', e));
	}
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}
