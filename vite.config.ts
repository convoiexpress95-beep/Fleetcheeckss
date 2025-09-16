import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || "https://lucpsjwaglmiejpfxofe.supabase.co";

  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "0.0.0"),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    server: {
      // Lier en IPv4 pour éviter les soucis de "localhost" qui pointe sur ::1
      host: "127.0.0.1",
      port: 8086,
      proxy: {
        "/supabase": {
          target: supabaseUrl,
          changeOrigin: true,
          secure: true,
          ws: true,
          // Éviter les warnings Chrome sur __cf_bm en supprimant les Set-Cookie du proxy en dev
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              if (proxyRes.headers['set-cookie']) {
                delete proxyRes.headers['set-cookie']
              }
            })
          },
          rewrite: (p) => p.replace(/^\/supabase/, ""),
        },
        "/mapbox": {
          target: "https://api.mapbox.com",
          changeOrigin: true,
          secure: true,
          ws: false,
          rewrite: (p) => p.replace(/^\/mapbox/, ""),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
  // Empêcher une éventuelle double instance de React (micro-sous-projets / symlinks) qui casserait les Context
  dedupe: ["react", "react-dom"],
    },
  };
});
