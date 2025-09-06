import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || "https://lucpsjwaglmiejpfxofe.supabase.co";

  return {
    server: {
      host: "::",
      port: 8080,
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
    },
  };
});
