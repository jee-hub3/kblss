import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Rocket,
    Search,
    Users,
    Sparkles,
    BookOpen,
    Trophy,
    Target,
    Heart,
    ChevronRight,
} from 'lucide-react';

/* ── Animation Variants ── */
const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            delay: i * 0.15,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.18, delayChildren: 0.2 },
    },
};

const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.03, y: -6, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ── Core Values Data ── */
const coreValues = [
    {
        icon: Rocket,
        title: '실행력',
        headline: '배움을 넘어 실전으로',
        desc: '이론 습득을 넘어 기획부터 결과물 도출까지 아이디어를 실행합니다.',
        gradient: 'from-violet-500 to-indigo-500',
        glow: 'shadow-violet-500/20',
    },
    {
        icon: Search,
        title: '문제 해결',
        headline: '스스로 정의하고 해결하는 힘',
        desc: '수동적인 태도를 벗어나 주도적으로 해결책을 찾습니다.',
        gradient: 'from-cyan-500 to-blue-500',
        glow: 'shadow-cyan-500/20',
    },
    {
        icon: Users,
        title: '협업',
        headline: '혼자가 아닌 함께 만드는 임팩트',
        desc: '피드백을 주고받으며 동반 성장하는 문화를 지향합니다.',
        gradient: 'from-amber-500 to-orange-500',
        glow: 'shadow-amber-500/20',
    },
];

/* ── Roadmap Data ── */
const roadmapSteps = [
    {
        year: '1학년',
        phase: '적응 & 경험',
        desc: '랩실 적응 및 공모전 완주 경험',
        icon: BookOpen,
        color: 'from-emerald-400 to-teal-500',
        ring: 'ring-emerald-400/30',
    },
    {
        year: '2학년',
        phase: '실전 & 역량',
        desc: '본격적인 공모전 참가 및 자격증 스터디',
        icon: Target,
        color: 'from-blue-400 to-indigo-500',
        ring: 'ring-blue-400/30',
    },
    {
        year: '3학년',
        phase: '진로 심화',
        desc: '진로 관련 공모전 핵심 역할 수행 및 결과물 도출',
        icon: Trophy,
        color: 'from-violet-400 to-purple-500',
        ring: 'ring-violet-400/30',
    },
    {
        year: '4학년',
        phase: '성과 & 환원',
        desc: '실질적 포트폴리오 완성 및 후배 서포트',
        icon: Heart,
        color: 'from-rose-400 to-pink-500',
        ring: 'ring-rose-400/30',
    },
];

/* ── Page Component ── */
const FitVision = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden">
            {/* ── Ambient background glows (light) ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-300/15 blur-[140px]" />
                <div className="absolute top-[40%] right-[20%] w-[25vw] h-[25vw] rounded-full bg-cyan-300/10 blur-[120px]" />
            </div>

            {/* ── Subtle grid overlay ── */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* ═══════════════════════════════════════════
                1. Fixed Back Button (always top-left)
            ═══════════════════════════════════════════ */}
            <Link
                to="/"
                className="fixed top-4 left-4 z-50 group inline-flex items-center gap-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-300"
            >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg group-hover:bg-white group-hover:border-slate-300 transition-all duration-300">
                    <ArrowLeft className="w-4.5 h-4.5" />
                </span>
                <span className="hidden md:inline bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg px-3 py-1.5 rounded-lg">메인으로 돌아가기</span>
            </Link>

            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs text-slate-400 tracking-widest uppercase bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg px-3.5 py-2.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Fit & Vision</span>
            </div>

            {/* ═══════════════════════════════════════════
                2. Intro / Hero
            ═══════════════════════════════════════════ */}
            <section className="relative z-10 pt-28 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} custom={0}>
                            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
                                <Sparkles className="w-3.5 h-3.5" />
                                인재상
                            </span>
                        </motion.div>
                        <motion.h1
                            variants={fadeInUp}
                            custom={1}
                            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-8"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                                KBLs가 추구하는
                            </span>
                            <br />
                            <span className="text-slate-900">핵심 가치와 성장 비전</span>
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            custom={2}
                            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                        >
                            우리가 어떤 가치를 중시하고, 어떤 궤도 위에서 함께 성장하는지
                            <br className="hidden md:block" />
                            한 눈에 확인해 보세요.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                3. Detailed Core Values
            ═══════════════════════════════════════════ */}
            <section className="relative z-10 py-32 lg:py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="text-center mb-20 lg:mb-28"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            custom={0}
                            className="text-sm font-bold tracking-widest uppercase text-indigo-500 mb-4"
                        >
                            Detailed Core Values
                        </motion.h2>
                        <motion.h3
                            variants={fadeInUp}
                            custom={1}
                            className="text-3xl md:text-5xl font-bold text-slate-900"
                        >
                            상세 핵심 가치
                        </motion.h3>
                        <motion.p
                            variants={fadeInUp}
                            custom={2}
                            className="mt-5 text-lg text-slate-500 max-w-xl mx-auto"
                        >
                            KBLs의 모든 활동을 관통하는 세 가지 DNA
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8 lg:gap-10"
                    >
                        {coreValues.map((v, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                custom={i}
                                initial="rest"
                                whileHover="hover"
                            >
                                <motion.div
                                    variants={cardHover}
                                    className="relative h-full p-10 lg:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-slate-300/80 transition-all duration-500"
                                >
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${v.gradient} shadow-lg mb-8`}>
                                        <v.icon className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">
                                        {v.title}
                                    </div>
                                    <h4 className="text-xl lg:text-2xl font-bold text-slate-900 mb-5 leading-snug">
                                        {v.headline}
                                    </h4>
                                    <p className="text-slate-500 leading-relaxed text-base">
                                        {v.desc}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                4. Roadmap by Year (Stepper)
            ═══════════════════════════════════════════ */}
            <section className="relative z-10 py-32 lg:py-40 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="text-center mb-20"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            custom={0}
                            className="text-sm font-bold tracking-widest uppercase text-indigo-500 mb-4"
                        >
                            Roadmap by Year
                        </motion.h2>
                        <motion.h3
                            variants={fadeInUp}
                            custom={1}
                            className="text-3xl md:text-5xl font-bold text-slate-900"
                        >
                            성장 궤도
                        </motion.h3>
                    </motion.div>

                    {/* Desktop: Horizontal stepper */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-40px' }}
                        variants={staggerContainer}
                        className="hidden md:block"
                    >
                        {/* Connector line */}
                        <div className="relative">
                            <div className="absolute top-10 left-[calc(12.5%)] right-[calc(12.5%)] h-[2px] bg-gradient-to-r from-emerald-500/40 via-indigo-500/40 to-pink-500/40" />

                            <div className="grid grid-cols-4 gap-6">
                                {roadmapSteps.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        variants={fadeInUp}
                                        custom={i}
                                        className="flex flex-col items-center text-center"
                                    >
                                        {/* Circle node */}
                                        <div className={`relative z-10 w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl ring-4 ${step.ring} ring-offset-2 ring-offset-slate-50 mb-6`}>
                                            <step.icon className="w-8 h-8 text-white" />
                                        </div>

                                        {/* Card below */}
                                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 w-full shadow-md hover:shadow-lg hover:border-slate-300/80 transition-all duration-300">
                                            <span className={`text-sm font-extrabold tracking-wider bg-gradient-to-r ${step.color} text-transparent bg-clip-text`}>
                                                {step.year}
                                            </span>
                                            <h4 className="text-lg font-bold text-slate-900 mt-2 mb-3">
                                                {step.phase}
                                            </h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile: Vertical timeline */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-40px' }}
                        variants={staggerContainer}
                        className="md:hidden relative"
                    >
                        {/* Vertical line */}
                        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/30 via-indigo-500/30 to-pink-500/30" />

                        <div className="space-y-8">
                            {roadmapSteps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    custom={i}
                                    className="relative flex items-start gap-5 pl-2"
                                >
                                    {/* Circle */}
                                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg ring-2 ${step.ring} ring-offset-1 ring-offset-slate-50`}>
                                        <step.icon className="w-5 h-5 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex-1 shadow-md">
                                        <span className={`text-xs font-extrabold tracking-wider bg-gradient-to-r ${step.color} text-transparent bg-clip-text`}>
                                            {step.year}
                                        </span>
                                        <h4 className="text-base font-bold text-slate-900 mt-1 mb-2">
                                            {step.phase}
                                        </h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                5. Bottom CTA
            ═══════════════════════════════════════════ */}
            <section className="relative z-10 py-32 lg:py-40 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={staggerContainer}
                    >
                        <motion.h2
                            variants={fadeInUp}
                            custom={0}
                            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                                우리의 궤도에 탑승할
                            </span>
                            <br />
                            <span className="text-slate-900">준비가 되셨나요?</span>
                        </motion.h2>

                        <motion.p
                            variants={fadeInUp}
                            custom={1}
                            className="text-lg text-slate-500 mb-12 max-w-xl mx-auto"
                        >
                            지금 지원하고, KBLs와 함께 성장하는 여정을 시작하세요.
                        </motion.p>

                        <motion.div variants={fadeInUp} custom={2}>
                            <Link
                                to="/apply"
                                className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold text-white overflow-hidden transition-all duration-500 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
                            >
                                {/* Button gradient background */}
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative z-10 flex items-center gap-2">
                                    네, 지금 바로 지원할게요
                                    <span className="text-xl">🚀</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer note */}
            <footer className="relative z-10 pb-10 pt-6 border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-slate-400">
                        © 2026 Key Bridge Leaders. This page is private.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default FitVision;
