/**
 * 라우트별 SEO 메타의 단일 소스.
 *
 * 두 곳에서 같은 값을 읽는다.
 *  1) 각 페이지 컴포넌트 → <Seo {...ROUTE_META['/apply']} /> (런타임, JS 실행 환경)
 *  2) scripts/generateRouteMeta.js → dist/<경로>/index.html의 head에 정적으로 주입
 *     (빌드 후처리, JS를 실행하지 않는 SNS 스크레이퍼용)
 *
 * 두 경로가 같은 모듈을 import하므로 값이 어긋날 수 없다. 문구를 고칠 때 여기만 고치면 된다.
 *
 * 이 파일은 순수 데이터만 둔다 — import도, import.meta도 쓰지 않는다.
 * 빌드 스크립트가 번들러 없이 순수 Node에서 그대로 import하기 때문이다.
 */

export const ROUTE_META = {
    '/': {
        path: '/',
        title: 'KBLs — Key Bridge Leaders',
        description: '실행과 협업으로 성장하는 실무형 인재들의 랩실. 공모전·프로젝트·스터디로 증명합니다.',
    },
    '/organization': {
        path: '/organization',
        title: 'Organization | KBLs',
        // 개별 역할을 열거하지 않는다 — 명단은 orgInfo.js가 소유하고, 여기 옮겨 적으면
        // 개편 때마다 어긋난다(실제로 '공모전·스터디·일정 담당'이 옛 직함으로 남아 있었다).
        description: '지도교수와 랩실장·부랩실장, 기능별 임원까지. KBLs를 움직이는 조직 구성과 각 역할을 소개합니다.',
    },
    '/activities': {
        path: '/activities',
        title: 'Activities | KBLs',
        description: '공모전, 자체 프로젝트, 스터디. KBLs가 실제로 하는 세 가지 활동과 각 활동이 남기는 산출물을 소개합니다.',
    },
    '/portfolio': {
        path: '/portfolio',
        title: 'Portfolio | KBLs',
        description: 'KBLs가 공모전과 프로젝트에서 쌓아온 수상 내역과 실제 산출물을 확인해 보세요.',
    },
    '/news': {
        path: '/news',
        title: 'News | KBLs',
        description: '공모전 수상, 스터디 결과, 활동 회고까지. KBLs 랩실의 최신 소식을 전합니다.',
    },
    '/apply': {
        path: '/apply',
        title: '지원하기 | KBLs',
        description: 'KBLs 신입 회원 모집 안내입니다. 지원 자격과 전형 일정을 확인하고 지원서를 작성해 보세요.',
    },
    '/faq': {
        path: '/faq',
        title: 'FAQ | KBLs',
        description: '지원 자격부터 활동 기간, 참여 방식까지. KBLs에 대해 자주 묻는 질문을 모았습니다.',
    },
    '/privacy': {
        path: '/privacy',
        title: '개인정보처리방침 | KBLs',
        description: 'KBLs가 수집하는 개인정보의 항목·목적·보유기간과 정보주체의 권리를 안내합니다.',
    },
    // 색인에서 빼는 페이지. 아래 STATIC_META_PATHS에서도 자동으로 제외된다.
    '/404': {
        path: '/404',
        title: '페이지를 찾을 수 없습니다 | KBLs',
        description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
        noindex: true,
    },
}

/**
 * 정적 HTML을 찍어낼 경로 목록.
 *
 * noindex 페이지는 스크레이퍼에 노출할 이유가 없으므로 자동으로 뺀다.
 * 결과는 public/sitemap.xml의 8개 경로와 일치해야 하며,
 * 어긋나면 빌드 스크립트가 경고를 낸다.
 */
export const STATIC_META_PATHS = Object.values(ROUTE_META)
    .filter((meta) => !meta.noindex)
    .map((meta) => meta.path)
