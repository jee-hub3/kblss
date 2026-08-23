/**
 * 빌드 후처리: 라우트별 정적 메타 HTML 생성.
 *
 * 목적은 성능이 아니라 SNS 스크레이퍼다. 이 사이트는 CSR이라 원본 HTML이 모든 경로에서
 * index.html의 기본 메타만 돌려준다. Googlebot은 JS를 실행해 페이지별 값을 보지만
 * 카카오톡·슬랙 등 대부분의 스크레이퍼는 JS를 실행하지 않아 기본값만 읽는다.
 * 그래서 head의 메타만 경로별 실제 값으로 바꾼 dist/<경로>/index.html을 찍어낸다.
 * 본문은 그대로 CSR이다 — 헤드리스 브라우저를 쓰지 않는 것이 이 방식의 핵심이다.
 *
 * ★ data-rh 마커
 * index.html의 메타에는 data-rh="true"가 달려 있고, Seo.jsx가 마운트될 때 이 표식이
 * 붙은 태그를 한 번 걷어낸다(React 19는 메타를 네이티브 호이스팅해서 helmet의 DOM
 * 조작 경로를 타지 않으므로, 정적 태그를 자동으로 회수해 주지 않는다).
 * 여기서는 태그를 새로 만들지 않고 "기존 태그의 값만 바꾼다". 그래서 마커가 그대로
 * 보존되고, 회수 로직이 지금과 똑같이 동작한다. 마커가 없으면 정적 메타가 런타임
 * 메타와 공존해 SPA 이동 후 og:title이 두 벌 남는다.
 *
 * 값의 출처는 src/lib/routeMeta.js 하나뿐이라 런타임 Seo와 어긋날 수 없다.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROUTE_META, STATIC_META_PATHS } from '../src/lib/routeMeta.js'
import { DEFAULT_OG_IMAGE, absoluteUrl } from '../src/lib/site.js'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '..')

const escapeAttr = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const escapeText = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * 정확히 한 번 매칭되는 치환. 못 찾거나 여러 번 찾으면 던져서 빌드를 세운다.
 * 조용히 넘어가면 기본 메타가 그대로 박힌 HTML이 배포되는데, 그건 이 작업의
 * 목적이 소리 없이 무너지는 경우라 실패로 처리하는 편이 낫다.
 */
function replaceOnce(html, pattern, replacer, label) {
    const matches = html.match(new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g'))
    if (!matches || matches.length === 0) {
        throw new Error(`[generate-route-meta] '${label}' 태그를 index.html에서 찾지 못했습니다. index.html의 메타 구조가 바뀌었는지 확인하세요.`)
    }
    if (matches.length > 1) {
        throw new Error(`[generate-route-meta] '${label}' 태그가 ${matches.length}개 발견됐습니다. 1개여야 합니다.`)
    }
    return html.replace(pattern, replacer)
}

/** 기존 태그의 content="..." 값만 바꾼다(속성 순서·data-rh 유지). */
function setMetaContent(html, key, kind, value, label) {
    // 속성이 줄바꿈으로 나뉘어 있을 수 있어 [\s\S]로 받는다.
    const pattern = new RegExp(
        `(<meta\\s+data-rh="true"\\s+${kind}="${key}"[\\s\\S]*?content=")[^"]*(")`,
    )
    return replaceOnce(html, pattern, `$1${escapeAttr(value)}$2`, label)
}

function buildHtmlForRoute(baseHtml, meta) {
    const url = absoluteUrl(meta.path)
    const image = absoluteUrl(meta.image || DEFAULT_OG_IMAGE)
    let html = baseHtml

    html = replaceOnce(
        html,
        /(<title\s+data-rh="true">)[\s\S]*?(<\/title>)/,
        `$1${escapeText(meta.title)}$2`,
        'title',
    )
    html = setMetaContent(html, 'description', 'name', meta.description, 'description')
    html = replaceOnce(
        html,
        /(<link\s+data-rh="true"\s+rel="canonical"\s+href=")[^"]*(")/,
        `$1${escapeAttr(url)}$2`,
        'canonical',
    )

    html = setMetaContent(html, 'og:title', 'property', meta.title, 'og:title')
    html = setMetaContent(html, 'og:description', 'property', meta.description, 'og:description')
    html = setMetaContent(html, 'og:url', 'property', url, 'og:url')
    html = setMetaContent(html, 'og:image', 'property', image, 'og:image')
    // Seo.jsx가 og:image:alt에 title을 그대로 넣으므로 런타임과 맞춘다.
    html = setMetaContent(html, 'og:image:alt', 'property', meta.title, 'og:image:alt')

    html = setMetaContent(html, 'twitter:title', 'name', meta.title, 'twitter:title')
    html = setMetaContent(html, 'twitter:description', 'name', meta.description, 'twitter:description')
    html = setMetaContent(html, 'twitter:image', 'name', image, 'twitter:image')

    return html
}

/** public/sitemap.xml과 대상 경로가 어긋나면 경고만 낸다(빌드는 세우지 않는다). */
function warnIfSitemapDiffers(paths) {
    const sitemapPath = join(projectRoot, 'public', 'sitemap.xml')
    if (!existsSync(sitemapPath)) return
    const xml = readFileSync(sitemapPath, 'utf8')
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
        try { return new URL(m[1]).pathname.replace(/(.)\/$/, '$1') } catch { return null }
    }).filter(Boolean)
    const missing = locs.filter((p) => !paths.includes(p))
    const extra = paths.filter((p) => !locs.includes(p))
    if (missing.length || extra.length) {
        console.warn(
            `[generate-route-meta] sitemap.xml과 대상 경로가 다릅니다. ` +
            `sitemap에만 있음: [${missing.join(', ')}] / 생성 대상에만 있음: [${extra.join(', ')}]`,
        )
    }
}

export async function generateRouteMeta({ outDir }) {
    const indexPath = join(outDir, 'index.html')
    const baseHtml = readFileSync(indexPath, 'utf8')

    warnIfSitemapDiffers(STATIC_META_PATHS)

    const written = []
    for (const path of STATIC_META_PATHS) {
        const meta = ROUTE_META[path]
        if (!meta) throw new Error(`[generate-route-meta] ROUTE_META에 '${path}' 항목이 없습니다.`)

        const html = buildHtmlForRoute(baseHtml, meta)

        // '/'는 dist/index.html 자체를 덮어써서 홈도 routeMeta를 단일 출처로 삼는다.
        const target = path === '/' ? indexPath : join(outDir, path, 'index.html')
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, html)
        written.push(path === '/' ? 'index.html' : `${path.slice(1)}/index.html`)
    }

    console.log(`[generate-route-meta] ${written.length}개 경로 생성: ${written.join(', ')}`)
}
