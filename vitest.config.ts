/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: './core/test/setup.tsx',
		globals: true,
		css: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'), // root of the project
		},
	},
});
