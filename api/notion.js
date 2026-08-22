export default async function handler(req, res) {
    // 1. 프론트엔드 요청 경로에서 실제 노션 API 경로만 추출
    const targetPath = req.url.replace(/^\/notion-api/, '');
    const targetUrl = `https://api.notion.com${targetPath}`;

    try {
        const options = {
            method: req.method,
            headers: {
                'Authorization': req.headers.authorization,
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
