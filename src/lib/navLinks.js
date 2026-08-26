/**
 * 사이트 메뉴의 단일 소스 — GNB(데스크톱·모바일 오버레이)와 푸터가 함께 읽는다.
 *
 * 전에는 두 곳이 각자 목록을 갖고 있어 같은 페이지가 헤더에서는 'News',
 * 푸터에서는 'Log & News'로 보였고 항목 순서도 달랐다. 라벨과 순서가
 * 어긋날 수 없도록 여기 하나만 둔다. (orgInfo.js·routeMeta.js와 같은 패턴 —
 * 순수 데이터만 두고 import는 쓰지 않는다.)
 *
 * 순서는 탐색 흐름을 따른다: 조직을 보고 → 활동을 보고 → 결과물을 보고 →
 * 소식을 보고 → 마지막에 FAQ로 확인한다.
 *
 * ★ inHeader — 헤더(GNB)에 노출할지. 목록에서 항목을 빼는 것과 다르다.
 *   배열에서 지우면 푸터에서도 함께 사라져 그 페이지가 어느 내비게이션에서도
 *   도달할 수 없게 된다(빌드도 콘솔도 멀쩡한 채로). 노출 위치는 데이터로 말한다.
 *
 *   FAQ만 inHeader: false다 — 오너 판단. FAQ는 상시 탐색 대상이 아니라
 *   지원 직전의 확인 단계이고, 헤더는 탐색 메뉴다. 푸터에는 그대로 남는다.
 *   ★ 헤더에 없는 것은 빠뜨린 게 아니라 결정이다. 도로 넣지 말 것.
 *
 * '지원하기'는 여기 넣지 않는다 — 메뉴 항목이 아니라 전환 CTA라
 * GNB는 버튼으로, 푸터는 강조 링크로 각자 다르게 그린다.
 */
export const NAV_LINKS = [
    { name: 'Organization', path: '/organization', inHeader: true },
    { name: 'Activities', path: '/activities', inHeader: true },
    { name: 'Portfolio', path: '/portfolio', inHeader: true },
    // 라벨은 Blog, 경로는 /news 유지 — 기존 공유 링크·sitemap을 깨지 않기 위한 오너 결정(2026-08).
    { name: 'Blog', path: '/news', inHeader: true },
    { name: 'FAQ', path: '/faq', inHeader: false },
];

/** 헤더에 노출할 항목만 — 순서는 NAV_LINKS 그대로 유지된다 */
export const HEADER_LINKS = NAV_LINKS.filter((link) => link.inHeader);
