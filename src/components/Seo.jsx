import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from '../lib/site'

// index.html에 심어둔 기본 메타는 JS 실행 전 크롤러를 위한 것이다.
// React 19에서는 react-helmet-async가 React의 네이티브 메타데이터 호이스팅을 타기
// 때문에 그 정적 태그를 회수하지 않고 자기 태그를 <head> 뒤에 덧붙인다. 그대로 두면
// og:title 같은 태그가 두 벌 남고, 대부분의 크롤러는 먼저 나온 쪽(기본값)을 읽는다.
// 그래서 React가 <head>를 넘겨받는 첫 렌더 직후에 표식이 달린 정적 태그를 걷어낸다.
let placeholdersCleared = false

const clearStaticPlaceholders = () => {
    if (placeholdersCleared || typeof document === 'undefined') return
    placeholdersCleared = true
    document.head.querySelectorAll('[data-rh="true"]').forEach((el) => el.remove())
}

/**
 * 페이지별 <title>과 메타 태그를 <head>에 주입한다.
 *
 * @param {string} title       페이지 제목. og:title / twitter:title에도 그대로 쓰인다.
 * @param {string} description 검색 결과와 공유 카드에 노출되는 설명.
 * @param {string} path        루트 기준 경로("/portfolio"). canonical과 og:url을 만든다.
 * @param {string} [image]     OG 이미지 경로. 생략하면 기본 이미지.
 * @param {string} [type]      og:type. 상세 페이지는 "article"을 넘긴다.
 * @param {boolean} [noindex]  true면 robots noindex를 출력한다. 404 등 색인 제외 페이지용.
 */
const Seo = ({ title, description, path = '/', image = DEFAULT_OG_IMAGE, type = 'website', noindex = false }) => {
    const url = absoluteUrl(path)
    const imageUrl = absoluteUrl(image)

    useEffect(clearStaticPlaceholders, [])

    return (
        <Helmet prioritizeSeoTags>
            <title>{title}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex" />}
            <link rel="canonical" href={url} />

            {/* Open Graph — 카카오톡·슬랙·페이스북 공유 미리보기 */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="ko_KR" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />

            {/* Twitter/X — summary_large_image는 1200x630 기준 */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
        </Helmet>
    )
}

export default Seo
