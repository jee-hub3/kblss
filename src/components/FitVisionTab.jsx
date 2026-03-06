import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Search, Users, Sparkles, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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
        desc: '이론 습득을 넘어 기획부터 결과물 도출까지 아이디어를 실행합니다',
        gradient: 'from-violet-500 to-indigo-500',
    },
    {
        icon: Search,
        title: '문제 해결',
        headline: '스스로 정의하고 해결하는 힘',
        desc: '수동적인 태도를 벗어나 주도적으로 해결책을 찾습니다',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        icon: Users,
        title: '협업',
        headline: '혼자가 아닌 함께 만드는 임팩트',
        desc: '피드백을 주고받으며 동반 성장하는 문화를 지향합니다',
        gradient: 'from-amber-500 to-orange-500',
    },
];

/* ── Roadmap Data (Icons replaced with Numbers) ── */
const roadmapSteps = [
    {
        year: '1학년',
        phase: '적응 & 경험',
        desc: '랩실 적응 및 공모전 완주 경험',
        number: '1',
        color: 'from-emerald-400 to-teal-500',
        ring: 'ring-emerald-400/30',
    },
    {
        year: '2학년',
        phase: '실전 & 역량',
        desc: '본격적인 공모전 참가 및 자격증 스터디',
        number: '2',
        color: 'from-blue-400 to-indigo-500',
        ring: 'ring-blue-400/30',
    },
    {
        year: '3학년',
        phase: '진로 심화',
        desc: '진로 관련 공모전 핵심 역할 수행 및 결과물 도출',
        number: '3',
        color: 'from-violet-400 to-purple-500',
        ring: 'ring-violet-400/30',
    },
    {
        year: '4학년',
        phase: '성과 & 환원',
        desc: '실질적 포트폴리오 완성 및 후배 서포트',
        number: '4',
        color: 'from-rose-400 to-pink-500',
        ring: 'ring-rose-400/30',
    },
];

const FitVisionTab = ({ onBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/#fit-section');
        setTimeout(() => {
            const el = document.getElementById('fit-section');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <div className="w-full bg-white text-slate-900 relative overflow-hidden rounded-t-[3rem]">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="absolute top-8 left-6 z-50 group inline-flex items-center justify-center p-2 transition-all duration-300"
            >
                <ArrowLeft className="w-8 h-8 text-slate-800 group-hover:text-brand-accent transition-colors" />
            </button>

            {/* 2. Intro / Hero */}
            <section className="relative z-10 pt-28 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                        <motion.h1
                            variants={fadeInUp}
                            custom={1}
                            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-8"
                        >
                            <span className="text-slate-900">
                                KBLs가 추구하는
                            </span>
                            <br />
                            <span className="text-brand-accent">핵심 가치와 성장 비전</span>
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            custom={2}
                            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                        >
                            우리가 어떤 가치를 중시하고, 어떤 궤도 위에서 함께 성장하는지
                            <br className="hidden md:block" />
                            한 눈에 확인해 보세요
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* 3. Detailed Core Values */}
            <section className="relative z-10 py-24 lg:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={staggerContainer} className="text-center mb-20 lg:mb-28">
                        <motion.h3 variants={fadeInUp} custom={1} className="text-3xl md:text-5xl font-bold text-slate-900">
                            상세 핵심 가치
                        </motion.h3>
                        <motion.p variants={fadeInUp} custom={2} className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
                            KBLs의 모든 활동을 관통하는 세 가지 DNA
                        </motion.p>
                    </motion.div>

                    <div className="flex flex-col gap-24 lg:gap-32">
                        {coreValues.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-100px' }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`flex flex-col md:flex-row items-center gap-12 lg:gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                <div className="flex-1 w-full lg:pr-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <v.icon className={`w-6 h-6 text-brand-accent`} />
                                        <span className="text-sm font-extrabold tracking-widest uppercase text-slate-400">{v.title}</span>
                                    </div>
                                    <h4 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight break-keep">{v.headline}</h4>
                                    <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg break-keep">{v.desc}</p>
                                </div>
                                <div className="w-full md:w-1/2 flex justify-center">
                                    <div className="w-full aspect-[4/3] rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <v.icon className="w-16 h-16 text-slate-200 mb-4 group-hover:scale-110 group-hover:text-brand-100 transition-all duration-500" />
                                        <span className="text-slate-400 font-bold text-lg">{v.title} Image Placeholder</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Roadmap by Year (Stepper) with large numbers */}
            <section className="relative z-10 py-24 lg:py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={staggerContainer} className="text-center mb-20">
                        <motion.h3 variants={fadeInUp} custom={1} className="text-3xl md:text-5xl font-bold text-slate-900">
                            성장 궤도
                        </motion.h3>
                    </motion.div>

                    {/* Desktop: Horizontal stepper */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={staggerContainer} className="hidden md:block">
                        <div className="relative">
                            <div className="absolute top-12 left-[calc(12.5%)] right-[calc(12.5%)] h-[1px] bg-slate-200" />

                            <div className="grid grid-cols-4 gap-6">
                                {roadmapSteps.map((step, i) => (
                                    <motion.div key={i} variants={fadeInUp} custom={i} className="flex flex-col items-center text-center">
                                        {/* Number Node */}
                                        <div className={`relative z-10 w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white mb-8 text-slate-900 font-extrabold text-5xl tracking-tighter shadow-sm`}>
                                            {step.number}
                                        </div>

                                        {/* Content block instead of card */}
                                        <div className="w-full px-4">
                                            <span className={`text-sm font-extrabold tracking-widest text-slate-400 block mb-2`}>
                                                {step.year}
                                            </span>
                                            <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{step.phase}</h4>
                                            <p className="text-base text-slate-500 leading-relaxed font-medium break-keep">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile: Vertical timeline */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={staggerContainer} className="md:hidden relative border-l border-slate-200 ml-6">
                        <div className="space-y-16 py-8">
                            {roadmapSteps.map((step, i) => (
                                <motion.div key={i} variants={fadeInUp} custom={i} className="relative flex flex-col gap-2 pl-12">
                                    {/* Number Node */}
                                    <div className={`absolute -left-8 top-0 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm text-slate-900 font-extrabold text-3xl tracking-tighter`}>
                                        {step.number}
                                    </div>

                                    {/* Content */}
                                    <div className="pt-2">
                                        <span className={`text-xs font-extrabold tracking-widest text-slate-400 block mb-1`}>
                                            {step.year}
                                        </span>
                                        <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{step.phase}</h4>
                                        <p className="text-base text-slate-500 leading-relaxed font-medium break-keep">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default FitVisionTab;
