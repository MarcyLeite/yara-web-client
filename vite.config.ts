import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const INITIAL_DATE = mode !== 'production' ? '24 Dec 1997 12:00:15 GMT' : ''
	return {
		plugins: [vue(), vueDevTools()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		define: {
			'import.meta.env.INITIAL_DATE': JSON.stringify(INITIAL_DATE),
		},
	}
})
