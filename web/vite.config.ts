import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    // 本地开发时把 /api 代理到后端服务（server/），与生产同源部署等价
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
