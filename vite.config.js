import {
	fileURLToPath,
	URL
} from 'node:url'

import {
	defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import postcssPxtorem from 'postcss-pxtorem'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		// vueDevTools(),
	],
	server: {
		port: 80,
		proxy: {
			'/dev-api': {
				target: 'http://192.168.1.110:8080/', // API服务器的地址
				changeOrigin: true, // 是否启用更改源（通常需要）
				rewrite: (path) => path.replace(/^\/dev-api/, '') // 重写路径
			},
			'/file-api': {
				target: 'http://192.168.1.137:9090/', // API服务器的地址
				changeOrigin: true, // 是否启用更改源（通常需要）
				rewrite: (path) => path.replace(/^\/file-api/, '') // 重写路径
			},
			'/api': {
				target: 'https://songsongwei.top/applet-api/', // API服务器的地址
				changeOrigin: true, // 是否启用更改源（通常需要）
				rewrite: (path) => path.replace(/^\/api/, '') // 重写路径
			}
		},
		open: true,
	},
	css: {
		postcss: {
			plugins: [postcssPxtorem({
				rootValue: 16,
				propList: ['*'],
				exclude: /node_modules/i
			})]
		}
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
})