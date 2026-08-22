import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        // 라이브러리를 앱 코드와 분리해 별도 청크로 뺀다.
        // 앱 코드를 고쳐도 벤더 청크의 해시는 그대로라 재방문 시 캐시가 유지된다.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          const p = id.replace(/\\/g, '/')
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(p)) return 'vendor-motion'
          if (/node_modules\/(react-router|react-router-dom)\//.test(p)) return 'vendor-router'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(p)) return 'vendor-react'
          return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/notion-api': {
        target: 'https://api.notion.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/notion-api/, ''),
      },
    },
  },
})
