import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), basicSsl()],
    server: {
        host: true, // Allow external connections
        port: 2812,
    },
    build: {
        minify: true,
        typescript: {
            ignoreBuildErrors: true,
        },
    },
})
