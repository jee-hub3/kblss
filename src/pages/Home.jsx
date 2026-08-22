import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import FlexibleImage from '../components/FlexibleImage';
import { ArrowRight, Trophy, Users, Lightbulb, Rocket, Loader2, Image as ImageIcon } from 'lucide-react';
import { queryDatabase, NOTION_DB } from '../lib/notion';
import DataNotice from '../components/DataNotice';
import Seo from '../components/Seo';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

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

    // 지표들의 기준일 중 가장 최근 것을 "YYYY.MM"으로 만든다.
    // ISO 날짜(YYYY-MM-DD)는 사전순 = 시간순이라 문자열 비교로 충분하다.
    const latestAsOf = (() => {
        const dates = kblsNumbersData.map(s => s.asOf).filter(Boolean);
        if (dates.length === 0) return '';
        const latest = dates.reduce((a, b) => (a > b ? a : b));
        const [year, month] = latest.split('-');
        return month ? `${year}.${month}` : year;
    })();

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
        <div className="w-full">
            <Seo
                path="/"
                title="KBLs — Key Bridge Leaders"
                description="실행과 협업으로 성장하는 실무형 인재들의 랩실. 공모전·프로젝트·스터디로 증명합니다."
            />
            {/* ═══════════════════════════════════════════
                1. Hero Section — 최초 중앙 정렬 테마로 복구
            ═══════════════════════════════════════════ */}
            <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 overflow-hidden bg-[#f8fafc]">
                {/* Animated Mesh Gradient Blobs */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full opacity-20 bg-blue-400 blur-[120px]"
                        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.15, 0.95, 1] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '-10%', left: '10%' }}
                    />
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full opacity-15 bg-teal-400 blur-[120px]"
                        animate={{ x: [0, -60, 50, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.1, 1] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '20%', right: '5%' }}
                    />
                    <motion.div
                        className="absolute w-[450px] h-[450px] rounded-full opacity-15 bg-emerald-300 blur-[100px]"
                        animate={{ x: [0, 40, -60, 0], y: [0, -40, 60, 0], scale: [1, 1.1, 0.9, 1] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        style={{ bottom: '5%', left: '25%' }}
                    />
                    <motion.div
                        className="absolute w-[550px] h-[550px] rounded-full opacity-10 bg-indigo-400 blur-[130px]"
                        animate={{ x: [0, -50, 30, 0], y: [0, 70, -50, 0], scale: [1, 1.05, 0.95, 1] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '40%', left: '50%' }}
                    />
                    <motion.div
                        className="absolute w-[400px] h-[400px] rounded-full opacity-10 bg-cyan-300 blur-[100px]"
                        animate={{ x: [0, 60, -30, 0], y: [0, -50, 40, 0], scale: [1, 0.95, 1.1, 1] }}
                        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '10%', right: '30%' }}
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-10 inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm"
                    >
                        <span className="text-sm font-semibold text-brand-800">2026년 KBLs 신규 회원 모집중</span>
                    </motion.div>

                    {/* Centered large typography — Elegant solid colors, reduced size */}
                    <motion.h1
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-8 leading-snug"
                    >
                        <motion.span variants={fadeInUp} className="block">
                            아이디어를 <span className="relative inline-block"><span className="relative z-10 font-black text-brand-accent">실행</span></span>으로
                        </motion.span>
                        <motion.span variants={fadeInUp} className="block mt-2">
                            사람을 <span className="relative inline-block"><span className="relative z-10 font-black text-brand-accent">연결</span></span>로
                        </motion.span>
                        <motion.span variants={fadeInUp} className="block mt-6 text-xl md:text-2xl text-slate-900 font-bold tracking-tight">
                            우리가 함께 성장을 증명하는 곳
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        세상에는 수많은 문제들이 있습니다.<br className="hidden md:block" />
                        중요한 것은, 행동하고 실천하며 해결책을 만들어가는 것입니다.
                    </motion.p>
                </div>

                {/* Bottom fade-out so the gradient blends into the next section */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[#f8fafc] z-[5] pointer-events-none" />
            </section>

            {/* ═══════════════════════════════════════════
                2. Our Identity
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-b from-[#f8fafc] via-white to-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="max-w-4xl mx-auto text-center"
                    >

                        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-900">
                            <span className="font-extrabold text-brand-accent tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">K</span>ey <span className="font-extrabold text-brand-accent tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">B</span>ridge <span className="font-extrabold text-brand-accent tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">L</span>eaders
                        </h2>
                        <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed tracking-tight">
                            KBLs는 다양한 전공과 배경을 가진 사람들이 협력하며 프로젝트를 진행하는 연구실 입니다. 단순한 프로젝트 팀이 아니라, 새로운 아이디어를 실현하고 실행력을 키우는 공간입니다.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                ★ Bridge Section — Pretendard + Split Layout 이미지
            ═══════════════════════════════════════════ */}
            <section className="relative py-24 md:py-32 bg-white overflow-hidden border-y border-slate-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">

                        {/* Left: Typography — Pretendard 명시 */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 lg:pr-16"
                        >

                            <h2
                                className="text-3xl md:text-4xl font-bold text-slate-900 leading-[1.2] tracking-tight"
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
                                <span className="text-sm font-semibold text-slate-400 tracking-wider uppercase" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>Connecting People, Growing Together.</span>
                            </div>
                        </motion.div>

                        {/* Right: Image placeholder — Pinterest-style overlapping panels */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="relative lg:pl-8"
                        >
                            <div className="relative">
                                {/* Tall background panel */}
                                <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden">
                                    <FlexibleImage baseSrc="/image/team" alt="KBLs 팀 단체 사진" width={1200} height={800} className="w-full h-full object-cover" />
                                </div>

                                {/* Floating overlap panel — bottom-left offset */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="absolute -bottom-8 -left-6 lg:-left-16 w-[60%] aspect-[3/2] rounded-2xl border-4 border-white shadow-xl overflow-hidden"
                                >
                                    <FlexibleImage baseSrc="/image/workshop" alt="KBLs 워크샵 및 회의" width={800} height={533} className="w-full h-full object-cover rounded-3xl shadow-xl border-4 border-white" />
                                </motion.div>

                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                3. What We Do
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-b from-white via-slate-50/70 to-slate-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="flex flex-col md:flex-row justify-between items-end mb-20"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">What We Do</h2>
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
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="w-14 h-14 text-brand-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-base">{item.desc}</p>
                                <div className="mt-6 h-px w-12 bg-slate-200 group-hover:w-20 group-hover:bg-brand-accent transition-all duration-500" />
                            </motion.div>
                        ))}
                    </div>

                    <Link to="/activities" className="md:hidden mt-12 w-full min-h-11 py-3 inline-flex justify-center items-center text-brand-accent font-semibold group">
                        우리의 활동 방식 자세히 보기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                4. KBLs in Numbers — 밝은 화이트/블루 그라데이션
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 relative overflow-hidden">
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">KBLs in Numbers</h2>
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
                            {kblsNumbersData.map((stat) => (
                                <motion.div
                                    key={stat.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: stat.order * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-indigo-500 mb-4 inline-flex items-center">
                                        {prefersReducedMotion
                                            ? <span>{stat.num}</span>
                                            : <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce />}
                                        <span>{stat.suffix}</span>
                                    </div>
                                    <div className="text-base text-slate-500 font-medium">{stat.title}</div>
                                    {stat.basis && (
                                        <div className="text-xs text-slate-400 mt-1.5 break-keep">{stat.basis}</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* 가장 최근 기준일 1회 표시. 기준일이 하나도 없으면 생략한다. */}
                    {!metricsError && latestAsOf && (
                        <p className="text-xs text-slate-400 text-center mt-12">기준: {latestAsOf}</p>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                5. Featured Portfolio
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-b from-indigo-50/30 via-white to-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="flex flex-col md:flex-row justify-between items-end mb-16"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Featured Portfolio</h2>
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
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i * 0.15 }}
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

                    <Link to="/portfolio" className="md:hidden mt-8 w-full min-h-11 py-3 inline-flex justify-center items-center text-brand-accent font-semibold group">
                        전체 포트폴리오 확인하기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                6. Who We Are Looking For
            ═══════════════════════════════════════════ */}
            <section id="fit-section" className="py-32 bg-gradient-to-b from-white to-slate-50">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Who We Are Looking For</h2>
                        <p className="text-lg text-slate-600">완벽하지 않아도 좋습니다. KBLs는 이런 열정을 가진 분을 기다립니다.</p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-6 mb-16">
                        {[
                            { tag: "#실행력", icon: <Rocket className="w-6 h-6 mr-3 text-brand-accent" /> },
                            { tag: "#협업", icon: <Users className="w-6 h-6 mr-3 text-brand-accent" /> },
                            { tag: "#주도성", icon: <Lightbulb className="w-6 h-6 mr-3 text-brand-accent" /> }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
                                className="flex items-center bg-white px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-shadow text-xl font-bold text-slate-800 border border-slate-100"
                            >
                                {item.icon}
                                {item.tag}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-8"
                    >
                        <Link
                            to="/organization?tab=vision"
                            className="inline-flex items-center text-lg text-slate-500 hover:text-brand-accent font-bold transition-all group"
                        >
                            내가 KBLs가 찾는 인재일까? <span className="text-brand-accent ml-2 border-b-2 border-brand-accent/30 pb-0.5">핏(Fit) 확인하기</span>
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                7. Bottom CTA
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-b from-white to-brand-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight text-slate-900">
                            스스로 문제를 정의하고<br />해결하고 싶다면,<br />KBLs와 함께하세요
                        </h2>
                        <Link to="/apply" className="inline-block bg-brand-accent hover:bg-blue-700 text-white px-10 py-5 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            KBLs 합류하기
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
