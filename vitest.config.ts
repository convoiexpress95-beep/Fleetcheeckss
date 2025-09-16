import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		}
	},
		test: {
			globals: true,
			environment: 'jsdom',
			include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
			exclude: ['**/useMissions.test.ts','**/useMissions.pagination.test.ts','node_modules','dist','**/route-missions-modern.test.tsx'],
			coverage: {
				provider: 'v8',
				reportsDirectory: './coverage',
				reporter: ['text','html','lcov'],
				exclude: ['**/mock-data-internal.ts','**/*.d.ts']
			},
			setupFiles: [],
		}
});
