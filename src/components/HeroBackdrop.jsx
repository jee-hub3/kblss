import React, { useEffect, useRef } from 'react';

/**
 * 홈 히어로 배경 — Bridge(점=사람, 선=연결) 노드-엣지 그래프의 4-레이어 깊이 무대.
 *
 * 무대에 perspective 1100px를 주고 레이어를 서로 다른 translateZ에 둔다:
 *   L0 기존 blur blob −320 · L1 원경 노드·엣지(작고 옅게) −180 ·
 *   L2 중경 주 그래프(선명) −60 · L3 근경 큰 점 몇 개 +140
 * translateZ가 만드는 시각 축소/확대는 scale(= 1100/(1100−z))로 보정해
 * 정지 상태의 화면 크기는 그대로 두고, 시차(마우스·스크롤)에서만 깊이가
 * 드러나게 한다.
 *
 * ★ 근경(L3)에는 blur 1.1px — 크기만 키우면 큰 점이지 앞에 있는 게 아니다.
 *   "초점 밖이라 흐리다"는 신호가 원근을 만든다.
 *
 * 추적 규약:
 *  - 마우스 시차는 무대 전체 rotateX/Y ±3.5° 이내, 레이어 이동은 깊이에
 *    비례(깊을수록 적게). 스크롤은 같은 계수로 더 약하게(×0.5).
 *  - rAF 하나로 묶고, 입력이 잦아들면 스스로 멈춘다 — 장식용 무한 rAF 금지
 *    (motion.js 기준 5항의 취지). 히어로가 뷰포트를 벗어나면 아예 쉰다.
 *  - 포인터가 coarse면 마우스 추적을 붙이지 않는다(터치는 스크롤 시차만).
 *    reduced-motion이면 시차 자체를 붙이지 않는다(정지 레이어만 남는다).
 *  - 커서가 문서를 나가면 원위치로 되돌린다.
 *
 * 그래프 좌표는 손으로 박은 정적 배열이다 — 런타임 난수를 쓰면 리렌더·SSR마다
 * 배경이 달라지고, 시각 결과를 리뷰로 고정할 수 없다.
 */

const MAX_TILT = 3.5; // deg
const SMOOTHING = 0.1;
const SETTLE_EPSILON = 0.002;

/* 레이어 정의 — z(px), 시차 이동 최대폭(px, 깊을수록 작게), blur는 근경만 */
const LAYERS = [
    { z: -320, shift: 4 },
    { z: -180, shift: 7 },
    { z: -60, shift: 12 },
    { z: 140, shift: 22, blur: 1.1 },
];

const PERSPECTIVE = 1100;
// 원근 투영의 시각 배율은 p/(p−z)이므로, 그 역수 (p−z)/p 를 곱해
// 정지 상태 크기를 원래대로 되돌린다(깊이는 시차에서만 드러난다).
const layerBase = ({ z }) => `translateZ(${z}px) scale(${((PERSPECTIVE - z) / PERSPECTIVE).toFixed(4)})`;

/* 원경(L1) — 작은 점·가는 선. 옅게 깔리는 군집이라 개수는 많고 색은 slate 한 톤. */
const FAR_NODES = [
    [90, 130], [210, 80], [330, 170], [470, 90], [610, 150], [760, 70],
    [900, 160], [1050, 90], [1180, 180], [1320, 110], [150, 320], [360, 380],
    [560, 300], [820, 360], [1020, 300], [1250, 370], [240, 560], [500, 620],
    [740, 560], [980, 640], [1200, 560], [1360, 660], [80, 700], [640, 760],
];
const FAR_EDGES = [
    [0, 1], [1, 3], [3, 5], [5, 7], [7, 9], [2, 4], [4, 6], [6, 8],
    [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [16, 17], [17, 18],
    [18, 19], [19, 20], [20, 21], [10, 16], [12, 17], [14, 19], [22, 16], [23, 18],
];

/* 중경(L2) — 주 그래프. 노드가 크고 선명하며, 허브 몇 개만 accent로 켠다
   (slate=배경의 사람들 / accent=연결이 완성된 자리 — 사이트 색 규칙과 같은 축). */
const MID_NODES = [
    { x: 140, y: 210, r: 3.5 }, { x: 340, y: 120, r: 3, hub: true }, { x: 560, y: 230, r: 4 },
    { x: 780, y: 130, r: 3 }, { x: 1000, y: 220, r: 3.5, hub: true }, { x: 1240, y: 140, r: 3 },
    { x: 220, y: 470, r: 3 }, { x: 460, y: 540, r: 3.5 }, { x: 700, y: 460, r: 5, hub: true },
    { x: 950, y: 540, r: 3 }, { x: 1180, y: 460, r: 3.5 }, { x: 1340, y: 580, r: 3 },
    { x: 120, y: 700, r: 3 }, { x: 400, y: 760, r: 3.5 }, { x: 900, y: 740, r: 3 }, { x: 1120, y: 700, r: 3 },
];
const MID_EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 7], [2, 8], [4, 9],
    [5, 10], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [6, 12], [7, 13],
    [8, 13], [9, 14], [10, 15], [13, 14], [14, 15],
];

/* 근경(L3) — 큰 점 몇 개만. 초점 밖(blur)이라 흐릿한 accent 계열. */
const NEAR_DOTS = [
    { x: 180, y: 260, r: 9, c: 'rgba(37,99,235,0.28)' },
    { x: 1230, y: 210, r: 7, c: 'rgba(99,102,241,0.24)' },
    { x: 380, y: 700, r: 11, c: 'rgba(37,99,235,0.20)' },
    { x: 1050, y: 660, r: 8, c: 'rgba(20,184,166,0.22)' },
    { x: 720, y: 120, r: 6, c: 'rgba(99,102,241,0.20)' },
];

const GraphSvg = ({ children, className, style }) => (
    <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full ${className ?? ''}`}
        style={style}
    >
        {children}
    </svg>
);

const HeroBackdrop = () => {
    const stageRef = useRef(null);
    const layerRefs = useRef([]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return undefined;
        const coarse = window.matchMedia('(pointer: coarse)').matches;

        const stage = stageRef.current;
        const layers = layerRefs.current.filter(Boolean);
        if (!stage || layers.length !== LAYERS.length) return undefined;

        // target/current 정규화 좌표(-1..1)와 스크롤 진행(0..1)
        const target = { x: 0, y: 0, s: 0 };
        const current = { x: 0, y: 0, s: 0 };
        let rafId = null;
        let inView = true;

        const apply = () => {
            stage.style.transform = `rotateX(${(-current.y * MAX_TILT).toFixed(3)}deg) rotateY(${(current.x * MAX_TILT).toFixed(3)}deg)`;
            layers.forEach((el, i) => {
                const { shift } = LAYERS[i];
                const dx = current.x * shift;
                // 스크롤은 마우스와 같은 깊이 계수를 쓰되 절반 세기로만 민다
                const dy = current.y * shift + current.s * shift * 0.5;
                el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) ${layerBase(LAYERS[i])}`;
            });
        };

        const settled = () =>
            Math.abs(current.x - target.x) < SETTLE_EPSILON &&
            Math.abs(current.y - target.y) < SETTLE_EPSILON &&
            Math.abs(current.s - target.s) < SETTLE_EPSILON;

        const tick = () => {
            current.x += (target.x - current.x) * SMOOTHING;
            current.y += (target.y - current.y) * SMOOTHING;
            current.s += (target.s - current.s) * SMOOTHING;
            apply();
            if (settled()) {
                Object.assign(current, target);
                apply();
                rafId = null; // 입력이 멎으면 루프도 멎는다
                return;
            }
            rafId = requestAnimationFrame(tick);
        };

        const wake = () => {
            if (rafId === null && inView) rafId = requestAnimationFrame(tick);
        };

        const onMouseMove = (e) => {
            target.x = (e.clientX / window.innerWidth) * 2 - 1;
            target.y = (e.clientY / window.innerHeight) * 2 - 1;
            wake();
        };
        const onMouseLeave = () => {
            target.x = 0;
            target.y = 0;
            wake();
        };
        const onScroll = () => {
            const h = stage.parentElement?.offsetHeight || window.innerHeight;
            target.s = Math.min(1, Math.max(0, window.scrollY / h));
            wake();
        };

        // 히어로가 화면 밖이면 추적을 쉰다 — 다른 섹션을 읽는 동안 rAF가 돌 이유가 없다
        const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (!inView && rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            } else if (inView) {
                wake();
            }
        });
        observer.observe(stage);

        if (!coarse) {
            window.addEventListener('mousemove', onMouseMove, { passive: true });
            document.documentElement.addEventListener('mouseleave', onMouseLeave);
        }
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            if (!coarse) {
                window.removeEventListener('mousemove', onMouseMove);
                document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            }
            window.removeEventListener('scroll', onScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            style={{ perspective: `${PERSPECTIVE}px` }}
        >
            {/* 기울여도 가장자리가 비지 않게 무대를 사방 6% 키워 둔다 */}
            <div
                ref={stageRef}
                className="absolute inset-[-6%]"
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
                {/* L0 — 기존 blur blob (키프레임·reduced-motion 가드는 index.css 그대로) */}
                <div
                    ref={(el) => { layerRefs.current[0] = el; }}
                    className="absolute inset-0"
                    style={{ transform: layerBase(LAYERS[0]) }}
                >
                    <div className="hero-blob hero-blob-1 absolute w-[600px] h-[600px] rounded-full opacity-20 bg-blue-400 blur-[120px]" style={{ top: '-10%', left: '10%' }} />
                    <div className="hero-blob hero-blob-2 absolute w-[500px] h-[500px] rounded-full opacity-15 bg-teal-400 blur-[120px]" style={{ top: '20%', right: '5%' }} />
                    <div className="hero-blob hero-blob-3 absolute w-[450px] h-[450px] rounded-full opacity-15 bg-emerald-300 blur-[100px]" style={{ bottom: '5%', left: '25%' }} />
                    <div className="hero-blob hero-blob-4 absolute w-[550px] h-[550px] rounded-full opacity-10 bg-indigo-400 blur-[130px]" style={{ top: '40%', left: '50%' }} />
                    <div className="hero-blob hero-blob-5 absolute w-[400px] h-[400px] rounded-full opacity-10 bg-cyan-300 blur-[100px]" style={{ top: '10%', right: '30%' }} />
                </div>

                {/* L1 — 원경 그래프: 작고 옅다 */}
                <div
                    ref={(el) => { layerRefs.current[1] = el; }}
                    className="absolute inset-0"
                    style={{ transform: layerBase(LAYERS[1]) }}
                >
                    <GraphSvg className="opacity-45">
                        <g stroke="#cbd5e1" strokeWidth="0.7">
                            {FAR_EDGES.map(([a, b], i) => (
                                <line key={i} x1={FAR_NODES[a][0]} y1={FAR_NODES[a][1]} x2={FAR_NODES[b][0]} y2={FAR_NODES[b][1]} />
                            ))}
                        </g>
                        <g fill="#94a3b8">
                            {FAR_NODES.map(([x, y], i) => (
                                <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.5} />
                            ))}
                        </g>
                    </GraphSvg>
                </div>

                {/* L2 — 중경 주 그래프: 선명. 허브만 accent */}
                <div
                    ref={(el) => { layerRefs.current[2] = el; }}
                    className="absolute inset-0"
                    style={{ transform: layerBase(LAYERS[2]) }}
                >
                    <GraphSvg className="opacity-70">
                        <g stroke="#c3d0e0" strokeWidth="1">
                            {MID_EDGES.map(([a, b], i) => (
                                <line key={i} x1={MID_NODES[a].x} y1={MID_NODES[a].y} x2={MID_NODES[b].x} y2={MID_NODES[b].y} />
                            ))}
                        </g>
                        {MID_NODES.map((n, i) => (
                            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.hub ? '#2563eb' : '#8ba3bd'} fillOpacity={n.hub ? 0.55 : 0.8} />
                        ))}
                    </GraphSvg>
                </div>

                {/* L3 — 근경 큰 점: ★ 1.1px blur가 원근의 핵심 */}
                <div
                    ref={(el) => { layerRefs.current[3] = el; }}
                    className="absolute inset-0"
                    style={{ transform: layerBase(LAYERS[3]), filter: `blur(${LAYERS[3].blur}px)` }}
                >
                    <GraphSvg>
                        {NEAR_DOTS.map((d, i) => (
                            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />
                        ))}
                    </GraphSvg>
                </div>
            </div>
        </div>
    );
};

export default HeroBackdrop;
