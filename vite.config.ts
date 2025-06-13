import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig(() => {
	const INITIAL_DATE = process.env.INITIAL_DATE ?? '24 Dec 1997 12:00:15 GMT'
	const API_PATH = process.env.CONFIG_PATH ?? '/'

	return {
		plugins: [
			vue(),
			vueDevTools(),
			AutoImport({
				imports: [
					'vue',
					{
						'vue-router/auto': ['useRoute', 'useRouter'],
					},
				],
				dts: 'src/auto-imports.d.ts',
				eslintrc: {
					enabled: true,
				},
				vueTemplate: true,
			}),
			Components({
				dts: 'src/components.d.ts',
			}),
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		define: {
			'import.meta.env.INITIAL_DATE': JSON.stringify(INITIAL_DATE),
			'import.meta.env.API_PATH': JSON.stringify(API_PATH),
		},
	}
})
