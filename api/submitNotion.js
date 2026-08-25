import { getDocWindowPhase } from '../src/lib/recruitSchedule.js';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 접수 기간 밖의 제출은 서버에서 막는다. 화면 게이팅은 우회할 수 있고,
    // 폼을 열어둔 채 마감을 넘긴 요청도 여기로 들어온다.
    // 판정 기준은 화면과 같은 단일 소스(src/lib/recruitSchedule.js)이며,
    // 경계가 KST(+09:00)로 못박혀 있어 이 함수가 UTC로 돌아도 결과가 같다.
    // reason·phase는 클라이언트가 "아직 시작 전"과 "마감"을 구분해
    // 알맞은 안내를 띄우기 위한 값이다(내부 정보는 싣지 않는다).
    const docPhase = getDocWindowPhase();
    if (docPhase !== 'open') {
        return response.status(403).json({
            error: docPhase === 'before'
                ? '서류 접수 기간이 아직 시작되지 않았습니다.'
                : '이번 학기 서류 접수가 마감되었습니다.',
            reason: 'doc-window',
            phase: docPhase,
        });
    }

    try {
        const {
            name, studentId, grade, major, phone,
            tools, motivation, interest, experience, participation, futurePlan, agreement, privacyAgreement
        } = request.body;

        // 어떤 항목이 비었는지 함께 돌려준다. 클라이언트가 화면 라벨로 바꿔 안내하므로
        // 사용자가 무엇을 고쳐야 하는지 알 수 있다. 필드명 외의 내부 정보는 싣지 않는다.
        const REQUIRED = {
            name, studentId, grade, major, phone,
            motivation, interest, experience, participation, futurePlan,
        };
        const missingFields = Object.keys(REQUIRED).filter((k) => !REQUIRED[k]);
        if (agreement === undefined) missingFields.push('agreement');

        if (missingFields.length > 0) {
            return response.status(400).json({ error: '모든 필수 항목을 입력해주세요.', missingFields });
        }

        // 개인정보 수집·이용 동의는 필수. 클라이언트 검증을 우회한 요청도 여기서 차단한다.
        if (privacyAgreement !== true) {
            return response.status(400).json({ error: '개인정보 수집·이용에 동의해야 지원할 수 있습니다.', missingFields: ['privacyAgreement'] });
        }

        // 전화번호는 숫자만 남겨 한 형식(하이픈 없는 숫자열)으로 통일해 저장한다.
        // 입력 예시에서 하이픈을 뺐어도 하이픈 포함 입력이 섞여 들어오면
        // 노션에서 정렬·중복 확인이 어려워지기 때문. 새 항목 수집이 아니라
        // 형식 통일이므로 개인정보처리방침 변경은 필요 없다.
        const normalizedPhone = String(phone).replace(/\D/g, '');
        if (!normalizedPhone) {
            return response.status(400).json({ error: '모든 필수 항목을 입력해주세요.', missingFields: ['phone'] });
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
                        phone_number: normalizedPhone
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
                    },
                    "개인정보 수집 동의": {
                        checkbox: Boolean(privacyAgreement)
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
