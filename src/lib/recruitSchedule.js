/**
 * 모집 전형 일정의 단일 소스 — ★ 매 학기 여기만 고치면 된다.
 *
 * 오너가 채울 값 (형식 예시):
 *   semesterLabel: "2026학년도 하반기"   // 홈 히어로 배지, /apply 제목·지원서 제목
 *   year: 2026                           // null이면 /apply 타임라인에 연도 미표시
 *   steps 날짜: "3/02~3/17" 형식         // /apply 타임라인 + 홈 요약 줄(서류 마감)
 *   docWindow: { open, close }           // 'YYYY-MM-DD' — 접수 폼을 열고 닫는 기준
 *
 * 세 곳에서 같은 값을 읽는다.
 *  1) Recruit.jsx → /apply "상세 모집 일정" 타임라인 + 접수 기간 게이팅
 *  2) Home.jsx → 히어로 아래 "서류 마감 O월 O일" 요약 한 줄
 *  3) api/submitNotion.js → 기간 밖 제출 거부 (클라이언트 게이팅은 우회 가능하다)
 *
 * 세 경로가 같은 모듈을 import하므로 값이 어긋날 수 없다.
 * 일정을 고칠 때 이 파일의 steps와 docWindow만 고치면 된다. (routeMeta.js와
 * 같은 패턴 — 순수 데이터·순수 함수만 두고 다른 모듈은 import하지 않는다.
 * 서버리스 함수도 이 파일을 그대로 불러 쓰므로 브라우저 전용 API를 쓰면 안 된다.)
 *
 * year는 옵셔널이다. 오너가 실제 일정을 확정하면서 연도를 채우면
 * /apply 타임라인의 각 날짜 앞에 "2026."처럼 붙여 표시되고,
 * null인 동안은 기존 화면과 완전히 동일하게 동작한다.
 * (metrics의 '산출 기준' 옵셔널 필드와 같은 하위 호환 패턴)
 * 홈 요약 줄에는 연도를 쓰지 않는다 — 모집 중인 시즌이라 맥락으로 명확하다.
 */
export const RECRUIT_SCHEDULE = {
    /** 모집 학년도·학기 라벨 — 홈 배지 / /apply 페이지 제목 / 지원서 제목이 함께 쓴다 */
    semesterLabel: "2026학년도 하반기",
    year: 2026,
    /* 오너 확정(2026-08-27): 서류 접수 08/28~09/09 · 서류 발표 09/06~09/10 ·
       인터뷰 09/07~09/11 · 최종 발표 09/13. 단계명은 오너 표현("인터뷰")을 따른다.
       "서류 접수" 제목은 DOC_STEP_TITLE이 찾는 키다 — 바꾸면 홈 요약 줄과
       접수 완료 화면의 '다음 일정'이 깨진다.

       ★ 단계 기간이 서로 겹친다(접수 ~09/09 · 발표 09/06~ · 인터뷰 09/07~).
       오너 확정 사항이다 — 겹침을 '오류'로 보고 임의로 조정하지 말 것. */
    steps: [
        { date: "8/28~9/09", title: "서류 접수" },
        { date: "9/06~9/10", title: "서류 발표" },
        { date: "9/07~9/11", title: "인터뷰" },
        { date: "9/13", title: "최종 발표" }
    ],

    /**
     * 서류 접수 기간 — 기계가 읽는 값. 접수 폼을 열고 닫는 판정과
     * D-day 계산, 서버의 기간 밖 제출 거부가 모두 이 값 하나만 본다.
     *
     * ★ 위 steps의 "서류 접수" 날짜와 반드시 같은 날을 가리켜야 한다.
     *   한쪽만 고치면 화면 타임라인과 실제 접수 가능 기간이 어긋난다 —
     *   일정을 바꿀 때 두 값을 함께 고칠 것.
     *   (steps는 사람이 읽는 표시용 문자열이라 "8월 말~9월 초" 같은 표현도
     *    허용해야 해서 파싱하지 않고 별도 필드로 둔다.)
     *
     * 경계는 KST(+09:00) 기준이며 close 당일 23:59:59.999까지 포함한다.
     * 아래 헬퍼가 오프셋을 문자열에 박아 계산하므로, 서버(Vercel=UTC)와
     * 브라우저(사용자 로컬 시간대)가 언제나 같은 판정을 낸다.
     */
    docWindow: { open: "2026-08-28", close: "2026-09-09" },
}

/** steps에서 서류 접수 단계를 찾는 키 — 표시 문자열이자 식별자다 */
export const DOC_STEP_TITLE = "서류 접수"

/** 한국 표준시 고정 오프셋. 한국은 서머타임이 없어 연중 +09:00으로 안전하다. */
const KST_OFFSET = "+09:00"
const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const MS_PER_DAY = 24 * 60 * 60 * 1000

/** 'YYYY-MM-DD' + 시각을 KST로 읽어 절대 시각(epoch ms)으로 바꾼다 */
function kstEpoch(date, time) {
    return Date.parse(`${date}T${time}${KST_OFFSET}`)
}

/** Date | number | undefined → epoch ms. 인자를 안 주면 지금. */
function toEpoch(now) {
    if (now === undefined || now === null) return Date.now()
    return now instanceof Date ? now.getTime() : Number(now)
}

/** 절대 시각이 KST 달력으로 며칠째인지. 날짜 차이(D-day)를 세는 데 쓴다. */
function kstDayIndex(epochMs) {
    return Math.floor((epochMs + KST_OFFSET_MS) / MS_PER_DAY)
}

/** 'YYYY-MM-DD' → '9/05' (타임라인 steps와 같은 M/DD 표기) */
function docDateLabel(isoDate) {
    const [, month, day] = isoDate.split("-")
    return `${Number(month)}/${day}`
}

/** 접수 시작일 라벨 — "접수는 8/28부터" 안내에 쓴다 */
export function getDocOpenLabel() {
    return docDateLabel(RECRUIT_SCHEDULE.docWindow.open)
}

/** 접수 마감일 라벨 — 폼 헤더 "서류 마감 9/05"에 쓴다.
 *  홈 요약 줄은 문장형("9월 5일")이라 getDocDeadlineLabel()을 따로 쓴다. */
export function getDocCloseLabel() {
    return docDateLabel(RECRUIT_SCHEDULE.docWindow.close)
}

/** 접수 기간의 시작·종료 절대 시각. close는 그날 23:59:59.999까지 포함. */
export function getDocWindowRange() {
    const { open, close } = RECRUIT_SCHEDULE.docWindow
    return {
        openAt: kstEpoch(open, "00:00:00.000"),
        closeAt: kstEpoch(close, "23:59:59.999"),
    }
}

/**
 * 지금이 접수 기간의 어디인지 — 'before'(시작 전) · 'open'(접수 중) · 'after'(마감).
 *
 * now를 주입할 수 있게 열어둔 이유: 시스템 시계를 건드리지 않고 세 상태를
 * 모두 검증하기 위해서다. 인자를 비우면 현재 시각을 쓴다.
 */
export function getDocWindowPhase(now) {
    const t = toEpoch(now)
    const { openAt, closeAt } = getDocWindowRange()
    if (t < openAt) return "before"
    if (t > closeAt) return "after"
    return "open"
}

/**
 * KST 달력 기준 마감까지 남은 일수. 마감 당일이면 0(D-day), 지났으면 음수.
 * 시각 차가 아니라 날짜 차라서 "9/04 23:50 → D-1"처럼 사람이 세는 것과 같다.
 */
export function getDaysUntilDocClose(now) {
    const closeDay = kstDayIndex(kstEpoch(RECRUIT_SCHEDULE.docWindow.close, "00:00:00.000"))
    return closeDay - kstDayIndex(toEpoch(now))
}

/**
 * 홈 요약 줄용 서류 마감일 라벨("3월 17일").
 * '서류 접수' 단계의 date에서 마지막 날짜를 파싱하므로,
 * steps의 날짜를 고치면 홈 요약도 자동으로 따라온다.
 */
export function getDocDeadlineLabel() {
    const docStep = RECRUIT_SCHEDULE.steps.find((s) => s.title === DOC_STEP_TITLE)
        ?? RECRUIT_SCHEDULE.steps[0]
    const lastDate = docStep.date.split("~").pop().trim() // "3/17"
    const [month, day] = lastDate.split("/").map(Number)
    return `${month}월 ${day}일`
}

/**
 * 서류 접수 이후의 전형 단계들 — 접수 완료 화면의 "다음 일정"에 쓴다.
 * steps에서 접수 단계까지를 잘라내므로 일정이 바뀌면 함께 따라온다.
 * 접수 단계를 못 찾으면(제목이 바뀐 경우) 전체 일정을 보여준다 —
 * 안내가 비는 것보다 낫다.
 */
export function getPostSubmitSteps() {
    const docIndex = RECRUIT_SCHEDULE.steps.findIndex((s) => s.title === DOC_STEP_TITLE)
    return RECRUIT_SCHEDULE.steps.slice(docIndex + 1)
}
