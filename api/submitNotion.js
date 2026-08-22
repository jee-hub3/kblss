export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const {
            name, studentId, grade, major, phone,
            tools, motivation, interest, experience, participation, futurePlan, agreement
        } = request.body;

        if (!name || !studentId || !grade || !major || !phone || !motivation || !interest || !experience || !participation || !futurePlan || agreement === undefined) {
            return response.status(400).json({ error: '모든 필수 항목을 입력해주세요.' });
        }

        const NOTION_API_KEY = process.env.NOTION_API_KEY;
        const NOTION_DATABASE_ID = process.env.NOTION_RECRUIT_DB_ID;

        if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
            console.error("Missing Notion environment variables");
            return response.status(500).json({ error: '서버 환경 변수가 설정되지 않았습니다.' });
        }

        const notionRes = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_DATABASE_ID },
                properties: {
                    "이름": {
                        title: [{ text: { content: name } }]
                    },
                    "학번": {
                        number: Number(studentId)
                    },
                    "학년": {
                        select: { name: grade }
                    },
                    "학과": {
                        rich_text: [{ text: { content: major } }]
                    },
                    "전화번호": {
                        phone_number: phone
                    },
                    "사용 가능한 툴": {
                        multi_select: Array.isArray(tools) ? tools.map(tool => ({ name: tool })) : []
                    },
                    "지원 동기 · 목적": {
                        rich_text: [{ text: { content: motivation } }]
                    },
                    "관심 분야 · 관심 직무": {
                        rich_text: [{ text: { content: interest } }]
                    },
                    "공모전·프로젝트 경험": {
                        rich_text: [{ text: { content: experience } }]
                    },
                    "랩실 활동 참여": {
                        select: { name: participation }
                    },
                    "하고 싶은 활동": {
                        rich_text: [{ text: { content: futurePlan } }]
                    },
                    "랩실 활동 참여 및 운영 규정 확인": {
                        checkbox: Boolean(agreement)
                    }
                }
            })
        });

        const data = await notionRes.json();

        if (!notionRes.ok) {
            console.error("Notion API Error:", data);
            return response.status(notionRes.status).json({ error: '노션 API 요청 실패', details: data });
        }

        return response.status(200).json({ success: true, message: '지원서가 성공적으로 제출되었습니다.' });

    } catch (error) {
        console.error("Serverless Function Error:", error);
        return response.status(500).json({ error: '서버 내부 오류 발생' });
    }
}
