export default async function handler(req, res) {
    // 1. 프론트엔드 요청 경로에서 실제 노션 API 경로만 추출
    const targetPath = req.url.replace(/^\/notion-api/, '');
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
