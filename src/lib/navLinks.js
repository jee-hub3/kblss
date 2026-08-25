/**
 * 사이트 메뉴의 단일 소스 — GNB(데스크톱·모바일 오버레이)와 푸터가 함께 읽는다.
 *
 * 전에는 두 곳이 각자 목록을 갖고 있어 같은 페이지가 헤더에서는 'News',
 * 푸터에서는 'Log & News'로 보였고 항목 순서도 달랐다. 라벨과 순서가
 * 어긋날 수 없도록 여기 하나만 둔다. (orgInfo.js·routeMeta.js와 같은 패턴 —
 * 순수 데이터만 두고 import는 쓰지 않는다.)
 *
 * 순서는 탐색 흐름을 따른다: 조직을 보고 → 활동을 보고 → 결과물을 보고 →
 * 소식을 보고 → 마지막에 FAQ로 확인한다. FAQ가 끝인 이유는 탐색이 아니라
 * 지원 직전의 확인 단계이기 때문이다.
 *
 * '지원하기'는 여기 넣지 않는다 — 메뉴 항목이 아니라 전환 CTA라
 * GNB는 버튼으로, 푸터는 강조 링크로 각자 다르게 그린다.
 */
export const NAV_LINKS = [
    { name: 'Organization', path: '/organization' },
    { name: 'Activities', path: '/activities' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'News', path: '/news' },
    { name: 'FAQ', path: '/faq' },
];
