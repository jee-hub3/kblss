import React from 'react';

/**
 * 로고의 5-bar 웨이브폼 모티프 — 사이트를 하나로 묶는 반복 요소.
 *
 * 좌표는 public/kbls-logo.svg의 rect 값 그대로다(비율 유지). 색만
 * currentColor로 바꿔 문맥의 텍스트 색을 따른다 — 로고 그라디언트는
 * 로고(img) 자리에만 남긴다.
 *
 * ★ 반복은 3자리 이내(과하면 촌스럽다): ① 홈 Identity 제목 아래
 *   ② 푸터 브랜드 행 ③ /apply 접수 완료 화면. 네 번째 자리를 만들려면
 *   셋 중 하나를 빼는 결정과 함께여야 한다.
 */
const BARS = [
    { x: 15.7, y: 272, h: 141 },
    { x: 146.7, y: 142, h: 399 },
    { x: 277.7, y: 12, h: 659 },
    { x: 408.7, y: 142, h: 399 },
    { x: 539.7, y: 272, h: 141 },
];

const Waveform = ({ className = '' }) => (
    <svg viewBox="0 0 624 689" aria-hidden="true" fill="currentColor" className={className}>
        {BARS.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width="70" height={b.h} rx="35" />
        ))}
    </svg>
);

export default Waveform;
