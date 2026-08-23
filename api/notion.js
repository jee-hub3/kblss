// 이 프록시는 워크스페이스 통합 토큰을 붙여 요청을 대신 보낸다. 경로를 그대로
// 흘려보내면 누구나 토큰 권한 범위의 노션 리소스를 읽고 쓸 수 있다(페이지 생성·수정 포함).
// 그래서 앱이 실제로 쓰는 세 가지 읽기 요청만 허용한다.
//   POST /v1/databases/{id}/query   목록 조회 (Portfolio·News·Home 지표·연혁)
//   GET  /v1/blocks/{id}/children   상세 본문 블록
//   GET  /v1/pages/{id}             상세 직접 진입 시 페이지 속성
// 여기에 없는 경로·메서드는 404로 막는다. 새 호출을 추가할 때 이 목록도 함께 늘려야 한다.
const NOTION_ID = '[0-9a-fA-F-]{32,36}';
const ALLOWED = [
    { method: 'POST', pattern: new RegExp(`^/v1/databases/${NOTION_ID}/query$`) },
    { method: 'GET', pattern: new RegExp(`^/v1/blocks/${NOTION_ID}/children$`) },
    { method: 'GET', pattern: new RegExp(`^/v1/pages/${NOTION_ID}$`) },
];

export default async function handler(req, res) {
    // 1. 프론트엔드 요청 경로에서 실제 노션 API 경로만 추출
    const targetPath = req.url.replace(/^\/notion-api/, '');

    // 쿼리스트링은 허용 판정에서 제외한다(현재 쓰는 호출에는 없다).
    const pathOnly = targetPath.split('?')[0];
    const isAllowed = ALLOWED.some((rule) => rule.method === req.method && rule.pattern.test(pathOnly));
    if (!isAllowed) {
        return res.status(404).json({ error: 'Not Found' });
    }

    const targetUrl = `https://api.notion.com${targetPath}`;

    // 토큰은 서버에서만 읽는다. 클라이언트가 보낸 Authorization 헤더는 신뢰하지 않고 무시한다.
    const notionApiKey = process.env.NOTION_API_KEY;
    if (!notionApiKey) {
        console.error('NOTION_API_KEY 환경변수가 설정되지 않았습니다.');
        return res.status(500).json({ error: '서버 설정 오류' });
    }

    try {
        const options = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        };

        // 2. POST 요청 바디 파싱 및 재전송
        if (req.method !== 'GET' && req.body) {
            options.body = Object.keys(req.body).length === 0 ? JSON.stringify({}) : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, options);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy Request Failed' });
    }
}
