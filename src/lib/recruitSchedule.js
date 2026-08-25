/**
 * 모집 전형 일정의 단일 소스 — ★ 매 학기 여기만 고치면 된다.
 *
 * 오너가 채울 값 (형식 예시):
 *   semesterLabel: "2026학년도 상반기"   // 홈 히어로 배지, /apply 제목·지원서 제목
 *   year: 2026                           // null이면 /apply 타임라인에 연도 미표시
 *   steps 날짜: "3/02~3/17" 형식         // /apply 타임라인 + 홈 요약 줄(서류 마감)
 *
 * 두 곳에서 같은 값을 읽는다.
 *  1) Recruit.jsx → /apply "상세 모집 일정" 타임라인
 *  2) Home.jsx → 히어로 아래 "서류 마감 O월 O일" 요약 한 줄
 *
 * 두 경로가 같은 모듈을 import하므로 값이 어긋날 수 없다.
 * 일정을 고칠 때 이 파일의 steps만 고치면 된다. (routeMeta.js와 같은 패턴 —
 * 순수 데이터만 두고 import는 쓰지 않는다.)
 *
 * year는 옵셔널이다. 오너가 실제 일정을 확정하면서 연도를 채우면
 * /apply 타임라인의 각 날짜 앞에 "2026."처럼 붙여 표시되고,
 * null인 동안은 기존 화면과 완전히 동일하게 동작한다.
 * (metrics의 '산출 기준' 옵셔널 필드와 같은 하위 호환 패턴)
 * 홈 요약 줄에는 연도를 쓰지 않는다 — 모집 중인 시즌이라 맥락으로 명확하다.
 */
export const RECRUIT_SCHEDULE = {
    /** 모집 학년도·학기 라벨 — 홈 배지 / /apply 페이지 제목 / 지원서 제목이 함께 쓴다 */
    semesterLabel: "2026학년도 상반기",
    year: null, // 예: 2026 — 오너가 일정 확정 시 채운다
    steps: [
        { date: "3/02~3/17", title: "서류 접수" },
        { date: "3/18", title: "서류 발표" },
        { date: "3/18~3/24", title: "면접" },
        { date: "3/25", title: "최종 발표" }
    ],
}

/**
 * 홈 요약 줄용 서류 마감일 라벨("3월 17일").
 * '서류 접수' 단계의 date에서 마지막 날짜를 파싱하므로,
 * steps의 날짜를 고치면 홈 요약도 자동으로 따라온다.
 */
export function getDocDeadlineLabel() {
    const docStep = RECRUIT_SCHEDULE.steps.find((s) => s.title === "서류 접수")
        ?? RECRUIT_SCHEDULE.steps[0]
    const lastDate = docStep.date.split("~").pop().trim() // "3/17"
    const [month, day] = lastDate.split("/").map(Number)
    return `${month}월 ${day}일`
}
