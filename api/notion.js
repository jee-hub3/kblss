export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const NOTION_API_KEY = process.env.NOTION_API_KEY;
        if (!NOTION_API_KEY) {
            return res.status(500).json({ error: 'Server configuration error (API Key missing)' });
        }

        // Endpoint routing based on query params or body
        const { endpoint, method = 'POST', body, ...otherParams } = req.method === 'POST' ? req.body : req.query;

        if (!endpoint) {
            return res.status(400).json({ error: 'Missing Notion endpoint param' });
        }

        const url = `https://api.notion.com/v1/${endpoint}`;

        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        };

        if (method !== 'GET' && method !== 'HEAD') {
            if (body) {
                options.body = JSON.stringify(body);
            } else if (req.method === 'POST' && req.body && Object.keys(req.body).length > 2) {
                // Pass through any other body params if body obj isn't explicitly defined, 
                // but only stringify the payload omitting the custom routing parameters
                const payloadOptions = { ...req.body };
                delete payloadOptions.endpoint;
                delete payloadOptions.method;
                if (Object.keys(payloadOptions).length > 0) {
                    options.body = JSON.stringify(payloadOptions);
                }
            }
        }

        const notionRes = await fetch(url, options);
        const data = await notionRes.json();

        if (!notionRes.ok) {
            return res.status(notionRes.status).json({ error: 'Notion API Error', details: data });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Serverless proxy error:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
