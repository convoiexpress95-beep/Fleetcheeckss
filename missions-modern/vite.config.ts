import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT || 8092);
  return {
    base: './',
    server: { host: true, port },
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, '../src') }
    }
  };
});
