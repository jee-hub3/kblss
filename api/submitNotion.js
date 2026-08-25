import { getDocWindowPhase } from '../src/lib/recruitSchedule.js';

// 노션 rich_text는 한 항목의 text.content가 2,000자를 넘으면 요청 전체를 400으로
// 거절한다. 긴 서술형 답변을 한 항목에 통째로 담으면 지원서 제출 자체가 실패하므로
// 2,000자 단위로 잘라 여러 항목으로 나눠 담는다. 노션은 이어진 항목을 한 문단으로
// 보여주므로 화면상 결과는 같다. (항목 수 상한은 100개 — 클라이언트가 5,000자로
// 막고 있어 최대 3개다.)
const NOTION_TEXT_LIMIT = 2000;

const toRichText = (value) => {
    const text = String(value ?? '');
    if (text.length <= NOTION_TEXT_LIMIT) {
        return [{ text: { content: text } }];
    }

    const chunks = [];
    for (let i = 0; i < text.length; i += NOTION_TEXT_LIMIT) {
        chunks.push({ text: { content: text.slice(i, i + NOTION_TEXT_LIMIT) } });
    }
    return chunks;
};

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

        // 학번 입력은 type="text" + inputMode="numeric"이다(휠·스피너로 값이 바뀌는
        // type="number"를 피했다). 숫자가 아닌 값이 들어오면 Number()가 NaN이 되어
        // 노션이 400을 돌려주는데, 그러면 사용자는 어디가 틀렸는지 알 수 없다.
        // 여기서 먼저 걸러 다른 필수 항목과 같은 방식(missingFields)으로 안내한다.
        const numericStudentId = Number(studentId);
        if (!Number.isInteger(numericStudentId)) {
            return response.status(400).json({ error: '학번은 숫자만 입력해주세요.', missingFields: ['studentId'] });
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
                        number: numericStudentId
                    },
                    "학년": {
                        select: { name: grade }
                    },
                    "학과": {
                        rich_text: toRichText(major)
                    },
                    "전화번호": {
                        phone_number: normalizedPhone
                    },
                    "사용 가능한 툴": {
                        multi_select: Array.isArray(tools) ? tools.map(tool => ({ name: tool })) : []
                    },
                    "지원 동기 · 목적": {
                        rich_text: toRichText(motivation)
                    },
                    "관심 분야 · 관심 직무": {
                        rich_text: toRichText(interest)
                    },
                    "공모전·프로젝트 경험": {
                        rich_text: toRichText(experience)
                    },
                    "랩실 활동 참여": {
                        select: { name: participation }
                    },
                    "하고 싶은 활동": {
                        rich_text: toRichText(futurePlan)
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
