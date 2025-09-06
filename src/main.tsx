import { createRoot, Root } from 'react-dom/client'
import React from 'react'
import App from './App.tsx'
import './index.css'

const rootEl = document.getElementById('root')!;
const w = window as unknown as { __FC_ROOT?: Root };
// Réutilise la même instance de root entre les rechargements HMR et
// s'assure que rootEl est encore dans le DOM avant de rendre
let root = w.__FC_ROOT;
if (!root) {
	root = createRoot(rootEl);
	w.__FC_ROOT = root;
} else {
	// En cas de HMR où le nœud racine a été remplacé, on reconstruit proprement
	if (!document.body.contains(rootEl)) {
		const freshEl = document.getElementById('root');
		if (freshEl) {
			root = createRoot(freshEl);
			w.__FC_ROOT = root;
		}
	}
}

if (import.meta.env.DEV) {
	// En dev, rendre sans StrictMode pour éviter les double-mount HMR qui
	// exacerbent certains problèmes de portails/DOM avec Chrome.
	root.render(<App />);
} else {
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}
