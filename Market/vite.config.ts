import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT || 8080);
  return {
  // Utiliser des chemins relatifs pour que le build puisse être copié sous /public/embeds
  base: "./",
    server: {
      // Écoute sur toutes interfaces pour accepter localhost/IPv4
      host: true,
      port,
    },
  plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
