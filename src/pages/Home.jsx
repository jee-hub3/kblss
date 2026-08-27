import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { ArrowRight, Trophy, Users, Lightbulb, Rocket, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { queryDatabase, NOTION_DB } from '../lib/notion';
import DataNotice from '../components/DataNotice';
import Seo from '../components/Seo';
import Button from '../components/Button';
import { ROUTE_META } from '../lib/routeMeta';
import { getDocDeadlineLabel, RECRUIT_SCHEDULE } from '../lib/recruitSchedule';
import { trackEvent } from '../lib/analytics';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다. 히어로만 보호 연출(hero*)을 쓴다.
import { fadeInUp, heroFadeInUp, heroStagger, DUR, EASE_OUT, VIEWPORT_ONCE } from '../lib/motion';

// OS '동작 줄이기' 설정 여부. react-countup은 MotionConfig(reducedMotion)의
// 영향을 받지 않으므로 카운트업 애니메이션을 직접 분기한다.
const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Home = () => {
    const navigate = useNavigate();

    // 1. KBLs in Numbers API 연동
    const [kblsNumbersData, setKblsNumbersData] = useState([]);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const [metricsError, setMetricsError] = useState(false);

    // '다시 시도'에서 재호출하므로 useEffect 밖으로 뺀다.
    const fetchMetrics = useCallback(async () => {
        setIsLoadingMetrics(true);
        setMetricsError(false);
        try {
            const results = await queryDatabase(NOTION_DB.metrics);

            const formattedData = results.map((item) => {
                const props = item.properties;
                const title = props['이름']?.title?.[0]?.plain_text || '';
                const valueStr = props['수치']?.rich_text?.[0]?.plain_text || '0';
                const order = props['순서']?.number || 0;

                const numMatch = valueStr.match(/\d+/);
                const num = numMatch ? parseInt(numMatch[0]) : 0;
                const suffix = valueStr.replace(/\d+/g, '');

                // '산출 기준'·'기준일'은 나중에 추가된 속성이라 없을 수 있다.
                // 옵셔널 체이닝으로 읽고 없으면 빈 값 → 렌더 단계에서 생략한다.
                const basis = props['산출 기준']?.rich_text?.map(rt => rt.plain_text).join('') || '';
                const asOf = props['기준일']?.date?.start || '';

                return {
                    id: item.id,
                    title,
                    value: valueStr,
                    num,
                    suffix,
                    order,
                    basis,
                    asOf
                };
            });

            formattedData.sort((a, b) => a.order - b.order);
            setKblsNumbersData(formattedData);

        } catch (error) {
            console.error("Error fetching metrics from Notion:", error);
            setMetricsError(true);
        } finally {
            setIsLoadingMetrics(false);
        }
    }, []);

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

    // 2. Featured Portfolio Data State
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(true);
    const [portfolioError, setPortfolioError] = useState(false);

    const fetchTopPortfolios = useCallback(async () => {
        setIsLoadingPortfolios(true);
        setPortfolioError(false);
        try {
            const results = await queryDatabase(NOTION_DB.portfolio);

            const formattedData = results.map((item, index) => {
                const props = item.properties;
                // Fallback gradients
                const gradients = [
                    "from-teal-400 to-emerald-600",
                    "from-blue-500 to-indigo-600",
                    "from-violet-500 to-purple-700",
                    "from-rose-400 to-red-600"
                ];

                const dateProp = props['기간']?.date;
                let dateStr = '';
                if (dateProp) {
                    const start = dateProp.start ? dateProp.start.replace(/-/g, '.') : '';
                    const end = dateProp.end ? dateProp.end.replace(/-/g, '.') : '';
                    dateStr = end ? `${start} ~ ${end}` : start;
                }

                return {
                    id: item.id,
                    title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
                    category: props['카테고리']?.select?.name || '기타',
                    summary: props['요약']?.rich_text?.[0]?.plain_text || '',
                    imageUrl: props['썸네일']?.files?.[0]?.file?.url || props['썸네일']?.files?.[0]?.external?.url || null,
                    tags: props['주요 사용 도구/작업']?.multi_select?.map(t => t.name) || [],
                    date: dateStr,
                    participants: props['참여']?.rich_text?.map(rt => rt.plain_text).join('') || '',
                    achievement: props['성과']?.rich_text?.map(rt => rt.plain_text).join('') || '',
                    isFeatured: props['메인 노출']?.checkbox || false, // Assuming checkbox property exists
                    imageGrad: gradients[index % gradients.length]
                };
            });

            // Filter by 'isFeatured' or just take top 3 if none featured
            const featured = formattedData.filter(p => p.isFeatured);
            const finalProjects = featured.length > 0 ? featured.slice(0, 3) : formattedData.slice(0, 3);

            setFeaturedProjects(finalProjects);

        } catch (error) {
            console.error("Error fetching portfolios for homepage:", error);
            setPortfolioError(true);
        } finally {
            setIsLoadingPortfolios(false);
        }
    }, []);

    useEffect(() => { fetchTopPortfolios(); }, [fetchTopPortfolios]);

    return (
        // home-flow-bg: 홈 전체가 한 장의 연속 그라디언트를 공유한다(index.css).
        // 섹션 배경은 전부 투명 — 배경이 섹션 경계에서 끊기지 않는다.
        // overflow-x-clip: 경계 위로 번지는 글로우들의 가로 삐짐만 자른다.
        // hidden이 아니라 clip이라 스크롤 컨테이너를 만들지 않고(sticky 유지),
        // 세로 번짐은 그대로 살아 섹션을 잇는다(Organization과 같은 수법).
        <div className="w-full home-flow-bg overflow-x-clip">
            <Seo {...ROUTE_META['/']} />
            {/* ═══════════════════════════════════════════
                1. Hero Section — 최초 중앙 정렬 테마로 복구
            ═══════════════════════════════════════════ */}
            {/* 88dvh: 다음 섹션 윗머리가 살짝 보이게(peek) 해 false bottom을 없앤다 */}
            <section className="relative min-h-[88dvh] flex items-center justify-center pt-20">
                {/* Animated Mesh Gradient Blobs.
                    framer-motion(JS 구동) 대신 CSS 키프레임으로 컴포지터에서만 돌린다
                    (키프레임 좌표·주기·easing은 index.css에 동일하게 이식).
                    무한 rAF 구동이 메인스레드 TBT에 얹히는 것을 막기 위한 조치로,
                    reduced-motion 분기도 index.css의 @media 가드가 담당한다.
                    구조: hero-light 래퍼(위치 + 조명 켜지듯 순차 블룸 등장)가
                    hero-blob(크기·색 + 상시 드리프트)을 감싼다 — 등장과 드리프트가
                    서로 다른 요소의 transform이라 충돌하지 않는다(index.css 참조).
                    ★ overflow-hidden을 걷어냈다(섹션·컨테이너 모두) — 글로우가
                    섹션 경계선에서 잘리는 것이 "배경이 끊긴다"는 인상의 원인이었다.
                    이제 아래 blob(-12%)이 Identity로 번져 경계를 잇는다.
                    가로 삐짐은 body의 overflow-x-hidden이 막는다. */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="hero-light hero-light-1 absolute" style={{ top: '-10%', left: '10%' }}>
                        <div className="hero-blob hero-blob-1 w-[600px] h-[600px] rounded-full opacity-20 bg-blue-400 blur-[120px]" />
                    </div>
                    <div className="hero-light hero-light-2 absolute" style={{ top: '20%', right: '5%' }}>
                        <div className="hero-blob hero-blob-2 w-[500px] h-[500px] rounded-full opacity-15 bg-teal-400 blur-[120px]" />
                    </div>
                    <div className="hero-light hero-light-3 absolute" style={{ bottom: '-12%', left: '25%' }}>
                        <div className="hero-blob hero-blob-3 w-[450px] h-[450px] rounded-full opacity-15 bg-emerald-300 blur-[100px]" />
                    </div>
                    <div className="hero-light hero-light-4 absolute" style={{ top: '40%', left: '50%' }}>
                        <div className="hero-blob hero-blob-4 w-[550px] h-[550px] rounded-full opacity-10 bg-indigo-400 blur-[130px]" />
                    </div>
                    <div className="hero-light hero-light-5 absolute" style={{ top: '10%', right: '30%' }}>
                        <div className="hero-blob hero-blob-5 w-[400px] h-[400px] rounded-full opacity-10 bg-cyan-300 blur-[100px]" />
                    </div>
                </div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        // 배지에는 그림자를 두지 않는다 — 그림자는 버튼(클릭 가능)의 시각 단서라
                        // 상태 태그가 이를 흉내내면 안 된다. 링크·버튼으로도 만들지 말 것.
                        className="mb-10 inline-flex items-center gap-2.5 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50"
                    >
                        {/* 모집이 '진행 중'임을 알리는 라이브 점(오너 지시 2026-08-26).
                            무한 루프는 CSS 키프레임 전용(모션 기준 5항) — 주기 2s로
                            기본 ping(1s)보다 낮춰 소음을 줄였다. 순수 장식이라 aria-hidden. */}
                        <span aria-hidden="true" className="relative flex w-2 h-2 shrink-0">
                            <span className="badge-live-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-60" />
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-accent" />
                        </span>
                        <span className="text-sm font-semibold text-brand-800">{RECRUIT_SCHEDULE.semesterLabel} 신입 회원 모집중</span>
                    </motion.div>

                    {/* 타이포 스케일의 display 단계(30→36→48px, 음수 tracking은 md~).
                        정의는 index.css의 @utility text-display. */}
                    {/* 히어로 스테이징은 오너 보호 연출 — motion.js의 hero* 값만 쓴다 */}
                    <motion.h1
                        variants={heroStagger}
                        initial="hidden"
                        animate="visible"
                        className="text-display font-extrabold text-slate-900 mb-8"
                    >
                        {/* 강조어 밑줄 스윕은 2026-08-27 오너 지시로 제거했다 —
                            강조는 색(brand-accent) + 굵기(font-black)만으로 한다.
                            index.css의 .hero-underline 규칙·키프레임도 함께 지웠으니
                            되살리려면 양쪽을 같이 복원해야 한다. */}
                        <motion.span variants={heroFadeInUp} className="block">
                            아이디어를 <span className="font-black text-brand-accent">실행</span>으로
                        </motion.span>
                        <motion.span variants={heroFadeInUp} className="block mt-2">
                            사람을 <span className="font-black text-brand-accent">연결</span>로
                        </motion.span>
                        <motion.span variants={heroFadeInUp} className="block mt-6 text-xl md:text-2xl text-slate-900 font-bold">
                            우리가 함께 성장을 증명하는 곳
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        {/* JSX는 줄바꿈에 붙은 공백을 지우므로, md 미만에서 br이 숨겨지면
                            문장이 붙는다. {' '}로 공백을 명시해 둔다. */}
                        세상에는 수많은 문제들이 있습니다.<br className="hidden md:block" />{' '}
                        중요한 것은, 행동하고 실천하며 해결책을 만들어가는 것입니다.
                    </motion.p>

                    {/* '지원하기'·'활동 둘러보기' 버튼은 오너 결정(2026-08-26)으로 제거 —
                        히어로는 서사 1장(문제를 만난다)만 맡고, 지원 전환은 서사를
                        완주한 하단 CTA(7장)가 맡는다. GA4 location 'home_hero'는
                        이 결정으로 소멸한다(퍼널 해석 시 참고).
                        ★ 아래 일정 링크가 남은 유일한 상호작용 요소이자 LCP 인접
                        요소이므로 opacity 초기값·delay를 걸지 않는다 (ADR —
                        문단이 delay 0.6s로 LCP 후보에서 빠져 1.4초 밀린 전력). */}
                    {/* 일정 요약 한 줄. 값은 recruitSchedule.js(단일 소스)에서 파생하므로
                        /apply 타임라인과 어긋날 수 없다. 4단계 표를 여기 복제하지 말 것.
                        연도는 쓰지 않는다 — 모집 중인 시즌이라 맥락으로 명확하다. */}
                    <Link
                        to="/apply"
                        onClick={() => trackEvent('apply_cta_click', { location: 'home_deadline' })}
                        className="mt-10 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-accent transition-colors group focus-ring rounded-md"
                    >
                        서류 마감 {getDocDeadlineLabel()} · 전형 일정 보기
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* 폭 전체 수평 페이드는 "여기서 페이지가 끝났다"는 잘못된 신호(false
                    bottom)를 주므로 제거했다. 다음 섹션이 from-[#f8fafc]로 시작해
                    배경 연결은 그대로 유지된다. */}
            </section>

            {/* ═══════════════════════════════════════════
                2. Our Identity — 서사 2장 '팀이 된다'
            ═══════════════════════════════════════════ */}
            {/* peek 장치(Numbers에서 이관): 히어로 바로 다음 섹션만 상단 패딩을
                48px로 고정해 첫 화면 하단에 제목이 실제로 걸치게 한다(false bottom
                방지). 배경은 래퍼의 home-flow-bg 연속 그라디언트가 담당한다. */}
            <section className="pt-12 pb-16 md:pb-32">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="max-w-4xl mx-auto text-center"
                    >

                        <h2 className="text-heading font-bold mb-10 text-slate-900">
                            <span className="font-extrabold text-brand-accent tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">K</span>ey <span className="font-extrabold text-brand-accent tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">B</span>ridge <span className="font-extrabold text-brand-accent tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">L</span>eaders
                        </h2>
                        <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed tracking-tight max-w-[68ch] mx-auto">
                            KBLs는 다양한 전공과 배경을 가진 사람들이 협력하며 프로젝트를 진행하는 랩실입니다. 단순한 프로젝트 팀이 아니라, 새로운 아이디어를 실현하고 실행력을 키우는 공간입니다.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                3. Bridge — 서사 2장 '팀이 된다' 계속 (Pretendard + Split Layout)
            ═══════════════════════════════════════════ */}
            <section className="relative py-16 md:py-32">
                {/* 중간 대역의 앰비언트 글로우 — 히어로·Numbers만 장식이 있고 이
                    구간이 플랫 화이트라 위아래와 단절돼 보였다. 히어로 blob과 같은
                    어휘의 옅은 빛을 이어 페이지 전체를 한 대기로 묶는다.
                    섹션 경계에 걸쳐 번지도록 클리핑하지 않는다(가로는 body가 막음). */}
                <div aria-hidden="true" className="absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full bg-blue-100/50 blur-[110px] pointer-events-none" />
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">

                        {/* Left: Typography — Pretendard 명시 */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: DUR.reveal, ease: EASE_OUT }}
                            className="relative z-10 lg:pr-16"
                        >

                            <h2
                                className="text-heading font-bold text-slate-900 leading-[1.2] tracking-tight"
                                style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
                            >
                                사람을 연결하고,<br />
                                <span className="text-brand-accent">함께 성장합니다</span>
                            </h2>
                            <p
                                className="mt-8 text-base md:text-lg text-slate-500 leading-relaxed max-w-lg"
                                style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
                            >
                                개인의 아이디어가 팀의 실행력을 만나면, 세상을 바꿀 수 있는 힘이 됩니다. KBLs는 그 연결의 다리(Bridge)를 놓습니다.
                            </p>
                            <div className="mt-10 flex items-center gap-3">
                                <div className="h-px w-16 bg-slate-300" />
                                <span className="text-sm font-semibold text-slate-500 tracking-wider uppercase" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>Connecting People, Growing Together.</span>
                            </div>
                        </motion.div>

                        {/* Right: 타이포 그래픽 — 스톡 일러스트를 제거했다.
                            기획서 원칙: 양산형 AI 이미지·스톡 금지, 실제 활동 사진 우선,
                            없으면 타이포·그래픽으로 대체. 실제 사진이 확보되면 이 자리를
                            사진 패널로 되돌린다. */}
                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: DUR.reveal, delay: 0.08, ease: EASE_OUT }}
                            className="relative lg:pl-8"
                        >
                            {/* 장식 이니셜 'B'와 하단 'The Bridge We Build' 캡션은
                                2026-08-27 오너 지시로 제거했다. 카드 안에는 3단 다이어그램만
                                남으므로 overflow-hidden(‘B’ 삐짐을 자르던 용도)도 함께 걷었다. */}
                            <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border border-slate-100 p-8 md:p-12">
                                {/* '연결의 다리' — 아이디어에서 성장까지를 잇는 타이포 다이어그램 */}
                                <ol className="relative">
                                    <li>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-label font-bold text-slate-500 tracking-widest tabular-nums">01</span>
                                            <span className="text-heading font-extrabold text-slate-900">아이디어</span>
                                        </div>
                                        <div aria-hidden="true" className="ml-2.5 h-10 w-px bg-gradient-to-b from-brand-accent/60 to-brand-accent/15 my-2" />
                                    </li>
                                    <li>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-label font-bold text-slate-500 tracking-widest tabular-nums">02</span>
                                            <span className="text-heading font-extrabold text-brand-accent">실행</span>
                                        </div>
                                        <div aria-hidden="true" className="ml-2.5 h-10 w-px bg-gradient-to-b from-brand-accent/60 to-brand-accent/15 my-2" />
                                    </li>
                                    <li>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-label font-bold text-slate-500 tracking-widest tabular-nums">03</span>
                                            <span className="text-heading font-extrabold text-slate-900">성장</span>
                                        </div>
                                    </li>
                                </ol>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                4. What We Do — 서사 3장 '만든다'
            ═══════════════════════════════════════════ */}
            <section className="py-16 md:py-32">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="flex flex-col md:flex-row justify-between items-end mb-20"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-heading font-bold mb-6 text-slate-900">What We Do</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                이론에서 멈추지 않습니다.<br />KBLs에서는 이런 실전 경험들이 당신의 일상이 됩니다.
                            </p>
                        </div>
                        <Link to="/activities" className="hidden md:inline-flex items-center text-brand-accent font-semibold hover:text-blue-800 transition-colors group">
                            우리의 활동 방식 자세히 보기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-16 md:gap-12">
                        {[
                            { icon: <Trophy className="w-8 h-8" />, title: "실전 공모전", desc: "실제 기업의 과제를 해결하며 실무 역량과 기획력을 기릅니다." },
                            { icon: <Lightbulb className="w-8 h-8" />, title: "자체 프로젝트", desc: "아이디어 발제부터 MVP 개발까지 우리만의 서비스를 만듭니다." },
                            { icon: <Users className="w-8 h-8" />, title: "성장 스터디", desc: "서로의 지식을 나누고 함께 성장하는 심도 깊은 스터디를 진행합니다." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={VIEWPORT_ONCE}
                                transition={{ duration: DUR.reveal, ease: EASE_OUT, delay: i * 0.08 }}
                                className="group"
                            >
                                <div className="w-14 h-14 text-brand-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-subhead font-bold mb-4 text-slate-900">{item.title}</h3>
                                <p className="text-slate-500 text-copy">{item.desc}</p>
                                {/* 밑줄 확장은 width 대신 scale-x — layout 속성은 애니메이트하지
                                    않는다(motion.js 기준 4항). w-20에서 60%로 접어두고 hover에 편다. */}
                                <div className="mt-6 h-px w-20 origin-left scale-x-[0.6] bg-slate-200 group-hover:scale-x-100 group-hover:bg-brand-accent transition-[scale,background-color] duration-300" />
                            </motion.div>
                        ))}
                    </div>

                    {/* 모바일 전용 링크는 hover가 없으므로 press가 유일한 탭 피드백이다 */}
                    <Link to="/activities" className="md:hidden mt-12 w-full min-h-11 py-3 inline-flex justify-center items-center text-brand-accent font-semibold group press focus-ring rounded-xl">
                        우리의 활동 방식 자세히 보기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                5. Featured Portfolio — 서사 3장 '만든다' (산출물)
            ═══════════════════════════════════════════ */}
            <section className="relative py-16 md:py-32">
                {/* 중간 대역 앰비언트 글로우 ② — Bridge의 것과 좌우 교차로 이어진다 */}
                <div aria-hidden="true" className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full bg-teal-100/40 blur-[110px] pointer-events-none" />
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="flex flex-col md:flex-row justify-between items-end mb-16"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-heading font-bold mb-6 text-slate-900">Featured Portfolio</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                치열한 고민 끝에 탄생한 산출물, <br />당신의 다음 포트폴리오가 될 수 있습니다.
                            </p>
                        </div>
                        <Link to="/portfolio" className="hidden md:inline-flex items-center text-brand-accent font-semibold hover:text-blue-800 transition-colors group">
                            전체 포트폴리오 확인하기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {isLoadingPortfolios ? (
                        <div className="w-full py-20 flex justify-center">
                            <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                        </div>
                    ) : portfolioError ? (
                        <DataNotice
                            title="데이터를 불러올 수 없습니다"
                            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                            onRetry={fetchTopPortfolios}
                            className="bg-slate-50 rounded-[2rem] border border-slate-100"
                        />
                    ) : featuredProjects.length === 0 ? (
                        <DataNotice
                            title="아직 공개된 프로젝트가 없습니다"
                            className="bg-slate-50 rounded-[2rem] border border-slate-100"
                        />
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
                            {featuredProjects.map((project, i) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={VIEWPORT_ONCE}
                                    transition={{ duration: DUR.reveal, ease: EASE_OUT, delay: i * 0.08 }}
                                    onClick={() => navigate(`/portfolio/${project.id}`, { state: { project } })}
                                    className="cursor-pointer group block"
                                >
                                    {/* Thumbnail container */}
                                    <div className={`w-full aspect-video rounded-2xl overflow-hidden mb-4 relative flex items-center justify-center bg-slate-100`}>
                                        {project.imageUrl ? (
                                            <img
                                                src={project.imageUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${project.imageGrad} text-white/50 group-hover:scale-105 transition-transform duration-700 ease-out`}>
                                                <ImageIcon className="w-8 h-8 mb-2" />
                                                <span className="text-sm font-bold">이미지가 없습니다</span>
                                            </div>
                                        )}
                                        {/* Optional subtle overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                    </div>

                                    {/* Minimalist details */}
                                    <div className="px-2">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-accent transition-colors line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">
                                            {project.category}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <Link to="/portfolio" className="md:hidden mt-8 w-full min-h-11 py-3 inline-flex justify-center items-center text-brand-accent font-semibold group press focus-ring rounded-xl">
                        전체 포트폴리오 확인하기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                6. KBLs in Numbers — 서사 4장 '완주한다'
            ═══════════════════════════════════════════ */}
            {/* ★ 2026-08-26 오너 결정: '히어로 직후 상향(성과 선노출, PR #18/271d347)'을
                뒤집어 서사 4장으로 내린다 — 맥락 없는 숫자는 "그래서 뭐"가 되고,
                팀(2장)·활동·산출물(3장)을 본 뒤에는 같은 숫자가 결론으로 읽힌다.
                근거 조사·되돌릴 조건: docs/adr/2026-08-26-numbers-demotion.md.
                peek 장치(pt-12)는 Identity로 이관했고, 배경의 blue·indigo 힌트는
                래퍼의 home-flow-bg 연속 그라디언트가 이 대역에서 깔아 준다
                (장식 blur 원 2개는 섹션에 남긴다). */}
            {/* overflow-hidden 없음 — 아래 장식 원(-10%)이 병합 섹션으로 번져
                Numbers → 마지막 섹션의 경계를 잇는다(히어로와 같은 결정) */}
            <section className="py-16 md:py-32 relative">
                <div className="absolute top-0 right-[-10%] w-[40%] aspect-square bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[30%] aspect-square bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <h2 className="text-heading font-bold mb-6 text-slate-900">KBLs in Numbers</h2>
                        <p className="text-lg text-slate-500">단순한 스터디를 넘어, 숫자가 증명하는 우리의 몰입</p>
                    </motion.div>

                    {isLoadingMetrics ? (
                        <div className="w-full py-20 flex justify-center">
                            <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                        </div>
                    ) : metricsError ? (
                        <DataNotice
                            title="데이터를 불러올 수 없습니다"
                            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                            onRetry={fetchMetrics}
                        />
                    ) : kblsNumbersData.length === 0 ? (
                        <DataNotice title="아직 등록된 지표가 없습니다" />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                            {/* 시차는 정렬 후의 배열 인덱스 기준이어야 한다. 노션 '순서' 원값을
                                그대로 곱하면 오너가 10/20/30으로 매기는 순간 지연이 1~3초가 된다. */}
                            {kblsNumbersData.map((stat, i) => (
                                <motion.div
                                    key={stat.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: DUR.reveal, delay: i * 0.08, ease: EASE_OUT }}
                                    className="text-center"
                                >
                                    <div className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-indigo-500 mb-4 inline-flex items-center">
                                        {prefersReducedMotion
                                            ? <span>{stat.num}</span>
                                            : <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce />}
                                        <span>{stat.suffix}</span>
                                    </div>
                                    <div className="text-base text-slate-500 font-medium">{stat.title}</div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    {/* 산출 기준은 수치 바로 아래에 둔다 — 페이지 끝에 두면 "무슨 기준이지?"
                        하는 사람이 끝까지 스크롤해 항목을 눈으로 맞춰야 한다.
                        기본 접힘으로 시각 무게만 덜어내고, 펼친 내용은 줄이지 않는다.
                        (등록 이슈 '산출 기준 미비로 인한 신뢰도 훼손' + PRD '각 수치에
                        산출 기준이 명시된다'가 근거라 없애거나 숨기면 안 된다.)
                        값이 하나도 없으면 아예 렌더하지 않는다 — 빈 토글이 남으면 안 되고,
                        오너가 노션을 채우면 배포 없이 나타나는 하위 호환도 그대로다.
                        <details>/<summary>는 네이티브 지원이라 별도 ARIA가 필요 없다. */}
                    {!metricsError && kblsNumbersData.some((s) => s.basis || s.asOf) && (
                        // 숫자 그룹에 붙은 각주로 둔다. 전에는 mt-12에 68ch 좌측 정렬이라
                        // 가운데 정렬된 숫자들과 축이 어긋난 채 빈 띠 위에 떠 있었고,
                        // 그래서 "이 숫자들의 기준"이 아니라 흘린 라벨로 읽혔다.
                        // 축을 가운데로 맞추고 위 여백을 줄여 숫자 바로 아래에 붙인다.
                        <details className="group mt-4">
                            <summary className="min-h-11 flex items-center justify-center gap-1.5 cursor-pointer list-none text-label font-medium text-slate-500 hover:text-slate-700 transition-colors focus-ring rounded-md">
                                지표 산출 기준
                                {/* 접힘 상태에서 눌리는 것임을 보이는 유일한 단서.
                                    회전 속도는 모션 기준의 base(0.3s) — src/lib/motion.js */}
                                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            {/* 펼친 내용은 문장이라 좌측 정렬로 읽는다. 축(mx-auto)만 가운데. */}
                            <ul className="mt-3 space-y-3 max-w-[68ch] mx-auto text-left">
                                {kblsNumbersData.filter((s) => s.basis || s.asOf).map((stat) => (
                                    <li key={stat.id} className="text-label text-slate-600 leading-relaxed break-keep">
                                        <span className="font-semibold text-slate-700">{stat.title}</span>
                                        {stat.basis && <> — {stat.basis}</>}
                                        {stat.asOf && <span className="text-slate-500"> (기준일 {stat.asOf})</span>}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                7. Who We Are Looking For + Bottom CTA — 서사 5장 '다음은 당신 차례'
            ═══════════════════════════════════════════ */}
            {/* 인재상과 마감 CTA를 한 섹션으로 병합(오너 지시 2026-08-26) —
                "이런 사람을 찾는다 → 그게 당신이라면 지원하라"가 한 호흡이 된다.
                #fit-section id는 섹션을 따라온다(2026-08-26 기준 저장소 내 사용처
                0곳 — e3c7290에서 인재상 탭 뒤로가기가 제거되며 소비자가 사라졌다.
                외부 공유 링크 대비로 유지).
                GA4 apply_cta_click location은 'home_bottom' 유지 — 병합 후에도
                홈 최하단 CTA라는 의미가 같아 기존 데이터와 연속 비교 가능하다.
                배경은 래퍼의 home-flow-bg가 brand-50으로 닫아 준다. */}
            <section id="fit-section" className="py-16 md:py-32">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-16"
                    >
                        <h2 className="text-heading font-bold mb-6 text-slate-900">Who We Are Looking For</h2>
                        <p className="text-lg text-slate-600">완벽하지 않아도 좋습니다. KBLs는 이런 열정을 가진 분을 기다립니다.</p>
                    </motion.div>

                    {/* 태그 필: scale 차이는 5% 이내, 스프링 없이(기준 2·3항). hover
                        그림자는 제거 — 그림자는 클릭 가능 요소의 단서인데 이 태그는
                        장식이다(히어로 배지의 그림자 금지와 같은 규칙). */}
                    <div className="flex flex-wrap justify-center gap-6 mb-16">
                        {[
                            { tag: "#실행력", icon: <Rocket className="w-6 h-6 mr-3 text-brand-accent" /> },
                            { tag: "#협업", icon: <Users className="w-6 h-6 mr-3 text-brand-accent" /> },
                            { tag: "#주도성", icon: <Lightbulb className="w-6 h-6 mr-3 text-brand-accent" /> }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: DUR.base, ease: EASE_OUT, delay: i * 0.08 }}
                                className="flex items-center bg-white px-8 py-4 rounded-full shadow-sm text-xl font-bold text-slate-800 border border-slate-100"
                            >
                                {item.icon}
                                {item.tag}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="mt-8"
                    >
                        <Link
                            to="/organization?tab=vision"
                            className="inline-flex items-center text-lg text-slate-500 hover:text-brand-accent font-bold transition-colors group focus-ring rounded-md"
                        >
                            내가 KBLs가 찾는 인재일까? <span className="text-brand-accent ml-2 border-b-2 border-brand-accent/30 pb-0.5">핏(Fit) 확인하기</span>
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* 마감 CTA — 인재상을 소화한 바로 다음 줄에서 전환한다.
                        기존 whileInView 리빌(fadeInUp)은 그대로 유지.
                        location 'home_bottom' 유지(위 병합 주석 참조). */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mt-20 md:mt-28 max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight text-slate-900">
                            스스로 문제를 정의하고<br />해결하고 싶다면,<br />KBLs와 함께하세요
                        </h2>
                        <Button to="/apply" size="lg" onClick={() => trackEvent('apply_cta_click', { location: 'home_bottom' })} className="transform hover:-translate-y-0.5">
                            지원하기
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
