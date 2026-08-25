import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { ArrowRight, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { queryDatabase, NOTION_DB } from '../lib/notion';
import DataNotice from '../components/DataNotice';
import Seo from '../components/Seo';
import Button from '../components/Button';
import HeroBackdrop from '../components/HeroBackdrop';
import Waveform from '../components/Waveform';
// 아이콘 크기·매핑은 src/lib/iconography.js 단일 소스에서 온다.
import { ICON, ACTIVITY_ICONS, VALUE_ICONS } from '../lib/iconography';
import { ROUTE_META } from '../lib/routeMeta';
import { getDocDeadlineLabel, RECRUIT_SCHEDULE } from '../lib/recruitSchedule';
import { trackEvent } from '../lib/analytics';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다. 히어로만 보호 연출(hero*)을 쓴다.
import { heroFadeInUp, heroStagger } from '../lib/motion';

// OS '동작 줄이기' 설정 여부. react-countup은 MotionConfig(reducedMotion)의
// 영향을 받지 않으므로 카운트업 애니메이션을 직접 분기한다.
const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 증거 연출(motion.js 참조): 이 섹션의 유일한 모션은 숫자가 목표에 닿는 것이다.
   카드 페이드·시차는 걷어냈다 — 세는 동안 slate(아직), 목표에 닿는 순간
   accent(완료)로 켜진다. 완료 색은 그라디언트가 아니라 단색 accent 하나 —
   색 규칙(slate=아직/accent=완료)에 제3의 색을 끼우지 않는다.
   reduced-motion은 처음부터 완료 상태로 렌더. */
const NumberStat = ({ stat }) => {
    const [done, setDone] = useState(prefersReducedMotion);
    return (
        <div className="border-t border-slate-300 pt-6">
            <div
                className={`text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums inline-flex items-baseline transition-colors duration-300 ${done ? 'text-brand-accent' : 'text-slate-500'}`}
            >
                {prefersReducedMotion
                    ? <span>{stat.num}</span>
                    : <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce onEnd={() => setDone(true)} />}
                <span>{stat.suffix}</span>
            </div>
            <div className="mt-3 text-copy text-slate-600 font-medium">{stat.title}</div>
        </div>
    );
};

/* 에디토리얼 섹션 헤더 — 홈의 모든 섹션이 같은 체계를 쓴다.
   전에는 섹션마다 "가운데 정렬 영문 제목 + 부제 + 파스텔 그라디언트 배경"이
   반복돼 어디서나 본 랜딩처럼 읽혔다. 영문 제목은 번호 달린 오버라인(meta)으로
   내리고 한글 문장을 헤딩으로 승격, 좌정렬 + 헤어라인 지면으로 바꾼다
   (Linear의 번호 인덱스 체계 참조). 오버라인 앞의 점은 히어로 그래프의
   노드 모티프를 섹션 인덱스로 잇는 최소 단위다. */
const SectionHeader = ({ index, overline, title, desc, link }) => (
    <div className="mb-14 md:mb-20 md:grid md:grid-cols-12 md:gap-8 md:items-end">
        <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-5">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                <span className="text-label font-bold tracking-[0.2em] text-slate-500 uppercase">{index} · {overline}</span>
            </div>
            <h2 className="text-heading font-bold text-slate-900 break-keep">{title}</h2>
        </div>
        {(desc || link) && (
            <div className="mt-6 md:mt-0 md:col-span-5 flex flex-col gap-4">
                {desc && <p className="text-copy text-slate-600 break-keep">{desc}</p>}
                {link}
            </div>
        )}
    </div>
);

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

            const formattedData = results.map((item) => {
                const props = item.properties;

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
                    // 무지개 그라디언트 fallback(imageGrad)은 제거 — 이미지 없는 카드는
                    // slate 지면 하나로 통일한다(팔레트 규율).
                    isFeatured: props['메인 노출']?.checkbox || false, // Assuming checkbox property exists
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
        <div className="w-full">
            <Seo {...ROUTE_META['/']} />
            {/* ═══════════════════════════════════════════
                1. Hero Section — 최초 중앙 정렬 테마로 복구
            ═══════════════════════════════════════════ */}
            {/* 88dvh: 다음 섹션 윗머리가 살짝 보이게(peek) 해 false bottom을 없앤다 */}
            <section className="relative min-h-[88dvh] flex items-center justify-center pt-20 overflow-hidden bg-[#f8fafc]">
                {/* 배경은 HeroBackdrop — Bridge 노드-엣지 그래프의 4-레이어 깊이 무대.
                    기존 blur blob은 그 안의 L0 레이어로 들어갔다(키프레임·reduced-motion
                    가드는 index.css 그대로). 시차 추적 규약은 컴포넌트 헤더 참조. */}
                <HeroBackdrop />

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        // 배지에는 그림자를 두지 않는다 — 그림자는 버튼(클릭 가능)의 시각 단서라
                        // 상태 태그가 이를 흉내내면 안 된다. 링크·버튼으로도 만들지 말 것.
                        className="mb-10 inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50"
                    >
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
                        <motion.span variants={heroFadeInUp} className="block">
                            아이디어를 <span className="relative inline-block"><span className="relative z-10 font-black text-brand-accent">실행</span></span>으로
                        </motion.span>
                        <motion.span variants={heroFadeInUp} className="block mt-2">
                            사람을 <span className="relative inline-block"><span className="relative z-10 font-black text-brand-accent">연결</span></span>로
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

                    {/* ★ CTA에는 opacity 초기값·delay를 절대 걸지 않는다 (ADR).
                        위 문단이 delay 0.6s 때문에 LCP 후보에서 빠져 LCP가 1.4초
                        밀린 전력이 있다. 버튼이 새 LCP 후보가 될 수 있으므로
                        처음부터 보이게 렌더한다. 움직임이 필요하면 transform만. */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button to="/apply" size="lg" onClick={() => trackEvent('apply_cta_click', { location: 'home_hero' })}>
                            지원하기
                        </Button>
                        <Button to="/activities" variant="secondary" size="lg">
                            활동 둘러보기
                        </Button>
                    </div>

                    {/* 일정 요약 한 줄. 값은 recruitSchedule.js(단일 소스)에서 파생하므로
                        /apply 타임라인과 어긋날 수 없다. 4단계 표를 여기 복제하지 말 것.
                        연도는 쓰지 않는다 — 모집 중인 시즌이라 맥락으로 명확하다.
                        CTA와 같은 이유로 opacity 애니메이션 없이 즉시 렌더. */}
                    <Link
                        to="/apply"
                        className="mt-6 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-accent transition-colors group focus-ring rounded-md"
                    >
                        서류 마감 {getDocDeadlineLabel()} · 전형 일정 보기
                        <ArrowRight className={`ml-1 ${ICON.meta} group-hover:translate-x-1 transition-transform`} />
                    </Link>
                </div>

                {/* 폭 전체 수평 페이드는 "여기서 페이지가 끝났다"는 잘못된 신호(false
                    bottom)를 주므로 제거했다. 다음 섹션이 from-[#f8fafc]로 시작해
                    배경 연결은 그대로 유지된다. */}
            </section>

            {/* ═══════════════════════════════════════════
                2. KBLs in Numbers — 히어로 바로 다음으로 상향 (성과 선노출)
            ═══════════════════════════════════════════ */}
            {/* peek 장치: 히어로 바로 다음 섹션만 상단 패딩을 48px로 고정해
                첫 화면 하단에 제목이 실제로 걸치게 한다(1440에서 pt-24면 12px만 노출).
                배경은 히어로(#f8fafc=slate-50)를 플랫하게 이어받는다 — 색 그라디언트
                배경과 장식 blur 원은 걷어냈다(섹션 배경은 white/slate-50 두 지면과
                헤어라인만 쓴다, SectionHeader 주석 참조). */}
            <section className="pt-12 pb-16 md:pb-28 bg-[#f8fafc]">
                <div className="container mx-auto px-6">
                    <SectionHeader
                        index="01"
                        overline="KBLs in Numbers"
                        title="숫자가 증명하는 우리의 몰입"
                        desc="단순한 스터디를 넘어, 시작이 아니라 끝까지 간 것을 셉니다."
                    />

                    {isLoadingMetrics ? (
                        <div className="w-full py-20 flex justify-center">
                            <Loader2 className={`${ICON.display} text-brand-accent animate-spin`} />
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                            {kblsNumbersData.map((stat) => (
                                <NumberStat key={stat.id} stat={stat} />
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
                        // 숫자 그룹에 붙은 각주로 둔다 — 숫자 그리드가 좌정렬로 바뀌었으므로
                        // 각주도 같은 축(좌)에 붙인다(축이 어긋나면 흘린 라벨로 읽힌다).
                        <details className="group mt-8">
                            <summary className="min-h-11 inline-flex items-center gap-1.5 cursor-pointer list-none text-label font-medium text-slate-500 hover:text-slate-700 transition-colors focus-ring rounded-md">
                                지표 산출 기준
                                {/* 접힘 상태에서 눌리는 것임을 보이는 유일한 단서.
                                    회전 속도는 모션 기준의 base(0.3s) — src/lib/motion.js */}
                                <ChevronDown className={`${ICON.meta} transition-transform duration-300 group-open:rotate-180`} />
                            </summary>
                            <ul className="mt-3 space-y-3 max-w-[68ch]">
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
                3. Our Identity
            ═══════════════════════════════════════════ */}
            <section className="py-16 md:py-28 bg-white border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <div className="md:grid md:grid-cols-12 md:gap-8">
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-3 mb-5">
                                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                                <span className="text-label font-bold tracking-[0.2em] text-slate-500 uppercase">02 · Identity</span>
                            </div>
                            {/* 낱자 drop-shadow·mix-blend 강조는 걷어냈다 — 이름 자체가
                                또렷하면 되고, 낱자 효과는 팔레트 규율만 흐린다.
                                K·B·L accent는 이니셜 정보라 색만 남긴다. */}
                            <h2 className="text-heading font-bold text-slate-900">
                                <span className="font-extrabold text-brand-accent">K</span>ey <span className="font-extrabold text-brand-accent">B</span>ridge <span className="font-extrabold text-brand-accent">L</span>eaders
                            </h2>
                            {/* 로고 5-bar 웨이브폼 — 브랜드 이름 바로 아래라 정보(정체성)를
                                더하는 자리다. 반복은 3자리 이내(Waveform.jsx 헤더 참조). */}
                            <Waveform className="h-5 w-auto mt-6 text-brand-accent/50" />
                        </div>
                        <p className="mt-8 md:mt-0 md:col-span-7 text-lg md:text-xl text-slate-800 font-medium leading-relaxed tracking-tight break-keep max-w-[68ch]">
                            KBLs는 다양한 전공과 배경을 가진 사람들이 협력하며 프로젝트를 진행하는 랩실입니다. 단순한 프로젝트 팀이 아니라, 새로운 아이디어를 실현하고 실행력을 키우는 공간입니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                ★ Bridge Section — Pretendard + Split Layout 이미지
            ═══════════════════════════════════════════ */}
            <section className="relative py-16 md:py-28 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">

                        {/* Left: Typography — Pretendard 명시 */}
                        <div className="relative z-10 lg:pr-16">
                            <div className="flex items-center gap-3 mb-5">
                                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                                <span className="text-label font-bold tracking-[0.2em] text-slate-500 uppercase">03 · The Bridge</span>
                            </div>
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
                        </div>

                        {/* Right: 타이포 그래픽 — 스톡 일러스트를 제거했다.
                            기획서 원칙: 양산형 AI 이미지·스톡 금지, 실제 활동 사진 우선,
                            없으면 타이포·그래픽으로 대체. 실제 사진이 확보되면 이 자리를
                            사진 패널로 되돌린다. */}
                        <div className="relative lg:pl-8">
                            {/* B 워터마크·그라디언트 배경은 걷어냈다(순수 장식). 패널은
                                플랫한 slate-50 + 헤어라인 — 다이어그램이 주인공이다. */}
                            <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-8 md:p-12">
                                {/* '연결의 다리' — 히어로 그래프와 같은 어휘(점=단계, 선=연결)로
                                    아이디어에서 성장까지를 잇는다. 실행만 accent — KBLs가
                                    켜 주는 단계가 실행이라서다. */}
                                <ol className="relative">
                                    <li>
                                        <div className="flex items-center gap-3">
                                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                            <span className="text-label font-bold text-slate-500 tracking-widest">01</span>
                                            <span className="text-heading font-extrabold text-slate-900">아이디어</span>
                                        </div>
                                        <div aria-hidden="true" className="ml-[2.5px] h-10 w-px bg-slate-300 my-2" />
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-3">
                                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                                            <span className="text-label font-bold text-slate-500 tracking-widest">02</span>
                                            <span className="text-heading font-extrabold text-brand-accent">실행</span>
                                        </div>
                                        <div aria-hidden="true" className="ml-[2.5px] h-10 w-px bg-slate-300 my-2" />
                                    </li>
                                    <li>
                                        <div className="flex items-center gap-3">
                                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                                            <span className="text-label font-bold text-slate-500 tracking-widest">03</span>
                                            <span className="text-heading font-extrabold text-slate-900">성장</span>
                                        </div>
                                    </li>
                                </ol>

                                <p className="mt-10 text-label font-semibold text-slate-500 tracking-wider uppercase">The Bridge We Build</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                3. What We Do
            ═══════════════════════════════════════════ */}
            <section className="py-16 md:py-28 bg-[#f8fafc] border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <SectionHeader
                        index="04"
                        overline="What We Do"
                        title="이론에서 멈추지 않습니다"
                        desc="KBLs에서는 이런 실전 경험들이 당신의 일상이 됩니다."
                        link={
                            <Link to="/activities" className="hidden md:inline-flex items-center text-brand-accent font-semibold hover:text-brand-accent-hover transition-colors group focus-ring rounded-md">
                                우리의 활동 방식 자세히 보기 <ArrowRight className={`ml-2 ${ICON.ui} group-hover:translate-x-1 transition-transform`} />
                            </Link>
                        }
                    />

                    <div className="grid md:grid-cols-3 gap-16 md:gap-12">
                        {/* 활동 축 ↔ 아이콘은 iconography.js ACTIVITY_ICONS 단일 소스 */}
                        {[
                            { axis: "공모전", title: "실전 공모전", desc: "실제 기업의 과제를 해결하며 실무 역량과 기획력을 기릅니다." },
                            { axis: "프로젝트", title: "자체 프로젝트", desc: "아이디어 발제부터 MVP 개발까지 우리만의 서비스를 만듭니다." },
                            { axis: "스터디", title: "성장 스터디", desc: "서로의 지식을 나누고 함께 성장하는 심도 깊은 스터디를 진행합니다." }
                        ].map((item, i) => {
                            const AxisIcon = ACTIVITY_ICONS[item.axis];
                            return (
                            <div
                                key={i}
                                className="group"
                            >
                                <div className="w-14 h-14 text-brand-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <AxisIcon className={ICON.display} />
                                </div>
                                <h3 className="text-subhead font-bold mb-4 text-slate-900">{item.title}</h3>
                                <p className="text-slate-500 text-copy">{item.desc}</p>
                                {/* 밑줄 확장은 width 대신 scale-x — layout 속성은 애니메이트하지
                                    않는다(motion.js 기준 4항). w-20에서 60%로 접어두고 hover에 편다. */}
                                <div className="mt-6 h-px w-20 origin-left scale-x-[0.6] bg-slate-200 group-hover:scale-x-100 group-hover:bg-brand-accent transition-[scale,background-color] duration-300" />
                            </div>
                            );
                        })}
                    </div>

                    {/* 모바일 전용 링크는 hover가 없으므로 press가 유일한 탭 피드백이다 */}
                    <Link to="/activities" className="md:hidden mt-12 w-full min-h-11 py-3 inline-flex justify-center items-center text-brand-accent font-semibold group press focus-ring rounded-xl">
                        우리의 활동 방식 자세히 보기 <ArrowRight className={`ml-2 ${ICON.ui} group-hover:translate-x-1 transition-transform`} />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                5. Featured Portfolio
            ═══════════════════════════════════════════ */}
            <section className="py-16 md:py-28 bg-white border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <SectionHeader
                        index="05"
                        overline="Featured Portfolio"
                        title="치열한 고민 끝에 탄생한 산출물"
                        desc="당신의 다음 포트폴리오가 될 수 있습니다."
                        link={
                            <Link to="/portfolio" className="hidden md:inline-flex items-center text-brand-accent font-semibold hover:text-brand-accent-hover transition-colors group focus-ring rounded-md">
                                전체 포트폴리오 확인하기 <ArrowRight className={`ml-2 ${ICON.ui} group-hover:translate-x-1 transition-transform`} />
                            </Link>
                        }
                    />

                    {isLoadingPortfolios ? (
                        <div className="w-full py-20 flex justify-center">
                            <Loader2 className={`${ICON.display} text-brand-accent animate-spin`} />
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
                            {featuredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => navigate(`/portfolio/${project.id}`, { state: { project } })}
                                    className="cursor-pointer group block"
                                >
                                    {/* Thumbnail container — 이미지 없는 카드의 무지개 그라디언트
                                        fallback은 걷어냈다. 팔레트는 slate 지면 + accent 하나다. */}
                                    <div className={`w-full aspect-video rounded-2xl overflow-hidden mb-4 relative flex items-center justify-center bg-slate-100 border border-slate-200`}>
                                        {project.imageUrl ? (
                                            <img
                                                src={project.imageUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                                                <ImageIcon className={`${ICON.ui} mb-2 text-slate-400`} />
                                                <span className="text-sm font-medium text-slate-500">이미지가 없습니다</span>
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
                                </div>
                            ))}
                        </div>
                    )}

                    <Link to="/portfolio" className="md:hidden mt-8 w-full min-h-11 py-3 inline-flex justify-center items-center text-brand-accent font-semibold group press focus-ring rounded-xl">
                        전체 포트폴리오 확인하기 <ArrowRight className={`ml-2 ${ICON.ui} group-hover:translate-x-1 transition-transform`} />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                6. Who We Are Looking For
            ═══════════════════════════════════════════ */}
            <section id="fit-section" className="py-16 md:py-28 bg-[#f8fafc] border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <SectionHeader
                        index="06"
                        overline="Who We Are Looking For"
                        title="완벽하지 않아도 좋습니다"
                        desc="KBLs는 이런 열정을 가진 분을 기다립니다."
                    />

                    {/* 가치 칩: 그림자·알약형은 걷어냈다 — 그림자는 클릭 가능 요소의
                        단서인데 이 칩은 장식이고(히어로 배지 규칙), 알약+그림자 조합이
                        양산형 랜딩의 상투였다. 헤어라인 칩으로 지면과 같은 문법을 쓴다. */}
                    <div className="flex flex-wrap gap-4 mb-14">
                        {/* 핵심 가치 ↔ 아이콘은 iconography.js VALUE_ICONS 단일 소스 —
                            조직 인재상 탭과 같은 아이콘을 쓴다 */}
                        {['실행력', '협업', '주도성'].map((value) => {
                            const ValueIcon = VALUE_ICONS[value];
                            return (
                                <div
                                    key={value}
                                    className="flex items-center bg-white px-6 py-3.5 rounded-xl text-lg font-bold text-slate-800 border border-slate-200"
                                >
                                    <ValueIcon className={`${ICON.ui} mr-3 text-brand-accent`} />
                                    #{value}
                                </div>
                            );
                        })}
                    </div>

                    <Link
                        to="/organization?tab=vision"
                        className="inline-flex items-center text-lg text-slate-500 hover:text-brand-accent font-bold transition-colors group focus-ring rounded-md"
                    >
                        내가 KBLs가 찾는 인재일까? <span className="text-brand-accent ml-2 border-b-2 border-brand-accent/30 pb-0.5">핏(Fit) 확인하기</span>
                        <ArrowRight className={`ml-2 ${ICON.ui} group-hover:translate-x-1 transition-transform`} />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                7. Bottom CTA
            ═══════════════════════════════════════════ */}
            {/* 마감 CTA는 어두운 지면(slate-900) — 파스텔 그라디언트 마감 대신
                푸터와 한 덩어리의 어두운 클로징으로 페이지를 닫는다(Activities의
                다크 섹션·푸터와 같은 지면). 푸터가 border-slate-800으로 구분한다. */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-10 leading-tight text-white break-keep">
                            스스로 문제를 정의하고<br />해결하고 싶다면,<br />KBLs와 함께하세요
                        </h2>
                        <Button to="/apply" size="lg" onClick={() => trackEvent('apply_cta_click', { location: 'home_bottom' })} className="transform hover:-translate-y-0.5">
                            지원하기
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
