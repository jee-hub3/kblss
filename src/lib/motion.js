/**
 * 모션 기준의 단일 소스 — ★ 새 애니메이션은 여기 토큰·variants를 조합해 만든다.
 *
 * 2026-08 기준 마련. NN/g duration 연구, Material 3 motion 토큰, WCAG 2.3.3을
 * 준거로 삼되, 당근·토스류의 "절제된 모션" 감성을 사이트 기준으로 채택했다.
 * (배경: fadeInUp/staggerContainer가 8개 파일에 복붙되며 y 30/40/50,
 *  duration 0.6/0.7/0.8, stagger 0.1~0.18로 표류한 것을 여기로 회수)
 *
 * 기준 요약
 *  1. duration 3계층 — fast 0.15(hover·tap) · base 0.3(탭·아코디언·상태 전환) ·
 *     reveal 0.6(스크롤 등장). UI 애니메이션은 0.6s를 넘지 않는다.
 *     예외는 오너가 연출 우선으로 확정한 홈 히어로 스테이징과 선 그리기뿐.
 *  2. easing은 EASE_OUT 하나로 통일. 감속 곡선은 등장에 쓰고,
 *     눈에 띄는 스프링·바운스는 쓰지 않는다.
 *  3. 스크롤 리빌은 이동 24px 이하·scale 차이 5% 이내, viewport once(재스크롤
 *     시 재생 금지), 형제 시차는 0.08s. 40px+ 슬라이드는 구식으로 읽힌다.
 *  4. 애니메이션 속성은 transform·opacity로 한정한다(컴포지터 전용).
 *     width·height·padding·box-shadow를 직접 애니메이트하지 않는다
 *     (아코디언의 height:auto만 관례상 예외).
 *  5. 무한 루프는 CSS 키프레임으로만 돌린다 — index.css의 hero-blob·path-dot
 *     참조. framer-motion의 rAF 무한 루프는 금지(TBT에 얹힌다).
 *  6. reduced-motion은 전역 이중 가드가 담당한다 — App.jsx의 MotionConfig +
 *     index.css @media 블록. framer 밖의 JS 구동(CountUp 등)만 개별 분기.
 *  7. 눌리는 요소는 press(눌림)·focus-ring(키보드) 피드백을 가진다 —
 *     index.css의 @utility press / focus-ring. CTA hover 리프트는
 *     -translate-y-0.5(2px) 단일값.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1]

export const DUR = { fast: 0.15, base: 0.3, reveal: 0.6 }

/** 스크롤 리빌 공통 뷰포트 — 진입 80px 전에 트리거, 한 번만 재생 */
export const VIEWPORT_ONCE = { once: true, margin: '-80px' }

/** 섹션 헤더·본문 블록 등장 — whileInView="visible"과 함께 쓴다 */
export const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

/** 자식들을 순차 등장시키는 컨테이너 — 시차 0.08s(기준 3항) */
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

/** 카드·칩 등장 — scale 차이 5% 이내라 덜컹거리지 않는다 */
export const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: DUR.reveal, ease: EASE_OUT } },
}

/** 필터·페이지네이션 그리드 아이템(AnimatePresence 등장/퇴장) — 스프레드해서 쓴다 */
export const gridItem = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: DUR.base, ease: EASE_OUT },
}

/**
 * 탭 패널 전환(AnimatePresence mode="wait") — 스프레드해서 쓴다.
 * dir 1: 오른쪽에서 들어옴(뒤 탭), -1: 왼쪽에서 들어옴(앞 탭).
 */
export const tabPanel = (dir = 1) => ({
    initial: { opacity: 0, x: 20 * dir },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 * dir },
    transition: { duration: DUR.base, ease: EASE_OUT },
})

/**
 * 방향이 바뀌는 탭 패널 전환 — AnimatePresence의 custom으로 방향을 넘긴다.
 * variants이므로 initial="enter" animate="center" exit="exit"로 쓴다.
 *
 * 위 tabPanel(dir)과 시각 결과는 같지만, 스프레드 방식은 방향을 '바꿔 가며'
 * 쓸 수 없다: AnimatePresence는 자식이 사라질 때 직전 렌더의 엘리먼트를
 * 캐시해 퇴장을 재생하므로, 나가는 쪽만 옛 방향으로 움직인다(실측 — 왼쪽
 * 탭으로 갈 때 나가는 패널이 계속 왼쪽으로 빠져 두 패널이 같은 방향으로
 * 겹쳐 보였다). custom은 나가는 자식에게도 현재 값이 전달돼 양쪽이 맞는다.
 *
 * 방향이 고정인 곳(Activities 스터디 탭 등)은 tabPanel을 그대로 쓰면 된다.
 */
export const tabPanelDirectional = {
    enter: (dir = 1) => ({ opacity: 0, x: 20 * dir }),
    center: { opacity: 1, x: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
    exit: (dir = 1) => ({ opacity: 0, x: -20 * dir, transition: { duration: DUR.base, ease: EASE_OUT } }),
}

/** 아코디언 height:auto 전환. 셰브론 회전은 CSS transition-transform duration-200 */
export const ACCORDION_TRANSITION = { duration: DUR.base, ease: EASE_OUT }

/* ── 오너 보호 연출 (변경 금지) ────────────────────────────────
   홈 히어로 스테이징은 성능(LCP)보다 연출을 우선한다는 오너 확정 결정으로,
   위 기준 1·3항의 명시적 예외다. 아래 값은 사용자 승인 없이 바꾸지 않는다.
   같은 이유로 Organization 조직도·Activities 경로의 선 그리기(pathLength)와
   FitVisionTab의 스토리텔링 시차도 각 파일의 로컬 값을 유지한다. */

export const heroFadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
}

export const heroStagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}
