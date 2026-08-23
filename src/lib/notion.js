/**
 * Notion API 호출을 한 곳으로 모은 모듈.
 *
 * 모든 요청은 /notion-api 프록시를 거친다.
 * (개발: vite.config.js의 server.proxy, 배포: api/notion.js)
 *
 * 인증 토큰은 클라이언트가 갖지 않는다. 프록시가 서버 환경변수
 * NOTION_API_KEY를 읽어 Authorization 헤더를 붙인다.
 * Notion-Version도 프록시가 관리한다.
 */

async function request(path, method = 'GET') {
    // 인증 헤더는 여기서 붙이지 않는다.
    // 브라우저 번들에 토큰이 들어가지 않도록 프록시가 서버 측에서 주입한다.
    const headers = {};
    if (method === 'POST') headers['Content-Type'] = 'application/json';

    const response = await fetch(`/notion-api/v1${path}`, { method, headers });

    // 호출부는 이미 try/catch로 감싸고 있으므로 여기서는 던지기만 한다.
    // status를 얹어두면 호출부가 "없는 id(404)"와 "일시적 실패"를 구분할 수 있다.
    if (!response.ok) {
        const error = new Error(`Notion API ${response.status} ${response.statusText} — ${path}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

/** 데이터베이스를 조회해 페이지 목록(results)을 돌려준다. */
export async function queryDatabase(databaseId) {
    const data = await request(`/databases/${databaseId}/query`, 'POST');
    return data.results;
}

/** 페이지·블록의 자식 블록 목록(results)을 돌려준다. */
export async function fetchBlockChildren(blockId) {
    const data = await request(`/blocks/${blockId}/children`);
    return data.results;
}

/**
 * 페이지 하나의 속성을 조회한다.
 *
 * 목록을 거치지 않고 상세 URL로 바로 들어온 경우(공유 링크·새로고침)에 쓴다.
 * 목록에서 넘어온 경우에는 location.state에 이미 데이터가 있어 호출하지 않는다.
 */
export async function fetchPage(pageId) {
    return request(`/pages/${pageId}`);
}

// ── 노션 속성 → 화면용 객체 매핑 ────────────────────────────────────────────
// 상세 페이지가 location.state 없이 들어왔을 때, 목록에서 넘겨주던 것과 같은
// 모양을 만들어야 렌더 코드를 그대로 쓸 수 있다.
// 주의: Portfolio.jsx / News.jsx는 목록용으로 같은 매핑을 인라인으로 갖고 있다.
// 노션 속성 이름을 바꿀 때는 양쪽을 함께 고쳐야 한다(추후 통합 대상).

const plain = (richText) => richText?.map((rt) => rt.plain_text).join('') || ''

/** 포트폴리오 페이지 → PortfolioDetail이 기대하는 project 객체 */
export function mapPortfolioPage(page) {
    const props = page.properties || {}
    const dateProp = props['기간']?.date
    let date = ''
    if (dateProp) {
        const start = dateProp.start ? dateProp.start.replace(/-/g, '.') : ''
        const end = dateProp.end ? dateProp.end.replace(/-/g, '.') : ''
        date = end ? `${start} ~ ${end}` : start
    }

    return {
        id: page.id,
        title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
        category: props['카테고리']?.select?.name || '기타',
        summary: props['요약']?.rich_text?.[0]?.plain_text || '',
        tags: props['주요 사용 도구/작업']?.multi_select?.map((t) => t.name) || [],
        date,
        participants: plain(props['참여']?.rich_text),
        achievement: plain(props['성과']?.rich_text),
    }
}

/** 뉴스 페이지 → NewsDetail이 기대하는 post 객체 */
export function mapNewsPage(page) {
    const props = page.properties || {}
    const dateProp = props['작성일']?.date

    return {
        id: page.id,
        title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
        tag: props['태그']?.select?.name || '소식',
        category: props['태그']?.select?.name || '소식',
        summary: props['요약']?.rich_text?.[0]?.plain_text || '',
        author: props['작성자']?.rich_text?.[0]?.plain_text || 'KBLs',
        date: dateProp?.start ? dateProp.start.replace(/-/g, '.') : '',
    }
}

/** .env에 정의된 데이터베이스 ID 모음 */
export const NOTION_DB = {
    metrics: import.meta.env.VITE_NOTION_METRICS_DB_ID,
    portfolio: import.meta.env.VITE_NOTION_PORTFOLIO_DB_ID,
    news: import.meta.env.VITE_NOTION_NEWS_DB_ID,
    history: import.meta.env.VITE_NOTION_HISTORY_DB_ID,
};
