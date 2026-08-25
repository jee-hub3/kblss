import { Trophy, Medal, Flag, Rocket, Sparkles, Users, Lightbulb, Search } from 'lucide-react'

/**
 * 아이콘 규격·매핑의 단일 소스 — ★ 아이콘 크기·카테고리 매핑은 여기서만 정한다.
 *
 * 규격 (2026-08 비주얼 개편 ③):
 *  1. 크기는 3단계뿐이다 — display 44 / ui 20 / meta 14.
 *     · display(w-11): 카드·타일의 주인공 아이콘, 섹션 로더, 상태 화면의 상징
 *     · ui(w-5): 본문·버튼·리스트 옆 보조 아이콘 (16px 본문과 나란히)
 *     · meta(w-3.5): 캡션·각주·뱃지·타임라인 노드 등 13px 라벨 곁
 *     중간 크기(16·24·28·32px)를 새로 만들지 않는다 — 세 단계 사이가
 *     벌어져 보이면 크기를 늘리지 말고 단계를 다시 고를 것.
 *  2. stroke는 1.75 고정 — index.css의 `svg.lucide` 전역 규칙이 담당한다.
 *     개별 strokeWidth prop을 흩뿌리지 않는다.
 *  3. ★ 아이콘은 정보를 더할 때만 쓴다 — 의미 없는 아이콘은 텍스트보다
 *     시끄럽다. 같은 아이콘을 장식으로 반복(워터마크 등)하지 않는다.
 */

export const ICON = {
    display: 'w-11 h-11', // 44px
    ui: 'w-5 h-5', // 20px
    meta: 'w-3.5 h-3.5', // 14px
}

/**
 * 연혁(History) 아이콘태그 매핑 — 노션 '아이콘태그' select 값이 키다.
 * Portfolio.jsx에 있던 switch를 옮겨 왔다. 키를 바꾸려면 노션 옵션과
 * 함께 바꿔야 한다(운영 가이드 '손대면 안 되는 것').
 * 색은 카테고리 정보라 accent 하나로 뭉개지 않는다 — 점등 연출(모션 ①)의
 * '켜진 상태' 색이 곧 이 값이다.
 */
export const HISTORY_ICONS = {
    '대상': { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    '수상(대상 제외)': { icon: Medal, color: 'text-blue-500', bg: 'bg-blue-50' },
    '연혁': { icon: Flag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    '활동': { icon: Rocket, color: 'text-purple-500', bg: 'bg-purple-50' },
}
export const HISTORY_ICON_FALLBACK = { icon: Sparkles, color: 'text-slate-400', bg: 'bg-slate-100' }

export const getHistoryIconProps = (iconTag) => HISTORY_ICONS[iconTag] ?? HISTORY_ICON_FALLBACK

/**
 * 핵심 가치 ↔ 아이콘 — 홈 인재상 필과 조직 인재상 탭이 같은 값을 읽는다.
 * (전에는 홈과 FitVisionTab이 각자 아이콘을 골라 '실행력'이 두 아이콘을 가졌다)
 */
export const VALUE_ICONS = {
    '실행력': Rocket,
    '협업': Users,
    '주도성': Lightbulb,
    '문제 해결': Search,
}

/**
 * 활동 축 ↔ 아이콘 — 홈 What We Do가 읽는다. Activities의 같은 개념
 * (공모전·프로젝트·스터디)에도 새 아이콘을 만들지 말고 이 값을 쓸 것.
 */
export const ACTIVITY_ICONS = {
    '공모전': Trophy,
    '프로젝트': Lightbulb,
    '스터디': Users,
}
