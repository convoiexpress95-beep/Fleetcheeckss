import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Plugin facultatif 'lovable-tagger' désactivé si non installé
let componentTagger: (() => any) | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  componentTagger = require('lovable-tagger').componentTagger;
} catch (_) {
  // module absent -> ignorer silencieusement
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: ([
    react(),
    mode === 'development' && componentTagger ? componentTagger() : null,
  ].filter(Boolean) as PluginOption[]),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
