// 사이트 전역 상수. og:url / canonical / sitemap의 기준이 되는 절대 도메인이다.
// 커스텀 도메인으로 옮길 때는 VITE_SITE_URL을 설정하거나 아래 기본값을 바꾸고,
// public/sitemap.xml과 public/robots.txt의 도메인도 함께 맞춰야 한다.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://kblss.vercel.app').replace(/\/$/, '')

export const SITE_NAME = 'KBLs'

// 1200x630 OG 이미지. public/og-image.png에 실제 파일이 있어야 미리보기가 뜬다.
export const DEFAULT_OG_IMAGE = '/og-image.png'

// 절대 URL이 아니면 SITE_URL을 앞에 붙인다.
// OG/트위터 카드 크롤러는 상대 경로를 해석하지 못한다.
export const absoluteUrl = (path = '') => {
    if (/^https?:\/\//.test(path)) return path
    return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
