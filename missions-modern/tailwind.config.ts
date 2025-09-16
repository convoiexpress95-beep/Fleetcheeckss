import type { Config } from 'tailwindcss';
import sharedConfig from '../tailwind.config';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    '../src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: sharedConfig.theme,
  plugins: sharedConfig.plugins,
} satisfies Config;
