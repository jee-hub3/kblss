import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// 빌드 시 폰트 CSS <link>를 <style> 인라인으로 치환한다.
// 렌더 차단 요청이 하나 줄고, woff2 URL(절대경로) 발견 시점이 HTML 파싱 시점으로
// 앞당겨진다. 개발 서버에서는 치환하지 않아도 public/이 그대로 서빙되므로 문제없다.
function inlineFontCss() {
  return {
    name: 'inline-font-css',
    apply: 'build',
    transformIndexHtml(html) {
      const css = readFileSync(resolve(__dirname, 'public/fonts/pretendard-dynamic-subset.css'), 'utf8')
      return html.replace(
        /<link rel="stylesheet" href="\/fonts\/pretendard-dynamic-subset\.css" \/>/,
        () => `<style>${css}</style>`,
      )
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 세 번째 인자를 ''로 주면 VITE_ 접두사가 없는 변수까지 읽는다.
  // NOTION_API_KEY는 서버 전용이라 접두사가 없다.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      inlineFontCss(),
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
        // 배포 환경의 api/notion.js와 같은 역할을 개발 서버에서 수행한다.
        // 토큰은 Node 쪽에서만 다루므로 브라우저로 내려가지 않는다.
        '/notion-api': {
          target: 'https://api.notion.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/notion-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.NOTION_API_KEY}`)
              proxyReq.setHeader('Notion-Version', '2022-06-28')
            })
          },
        },
      },
    },
  }
})
