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
    if (!response.ok) {
        throw new Error(`Notion API ${response.status} ${response.statusText} — ${path}`);
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

/** .env에 정의된 데이터베이스 ID 모음 */
export const NOTION_DB = {
    metrics: import.meta.env.VITE_NOTION_METRICS_DB_ID,
    portfolio: import.meta.env.VITE_NOTION_PORTFOLIO_DB_ID,
    news: import.meta.env.VITE_NOTION_NEWS_DB_ID,
    history: import.meta.env.VITE_NOTION_HISTORY_DB_ID,
};
