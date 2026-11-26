import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	publicDir: 'pwa',
	server: {
		host: '127.0.0.1',
		port: 5173,
	},
	resolve: {
		dedupe: [
			'firebase',
			'@firebase/app',
			'@firebase/auth',
			'@firebase/firestore',
		],
	},
})
