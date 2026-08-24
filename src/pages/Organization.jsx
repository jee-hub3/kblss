import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import FitVisionTab from '../components/FitVisionTab';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const GlassCard = ({ role, name, desc }) => (
    <motion.div
        variants={cardVariants}
        className="relative group h-full rounded-3xl p-8 transition-all duration-300 bg-white/60 backdrop-blur-md border border-white/50 shadow-sm hover:border-brand-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 flex flex-col items-center text-center"
    >
        {/* Subtle glow on hover for all cards */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-accent/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center flex-1 w-full">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 bg-brand-50 text-brand-accent group-hover:bg-brand-100 shrink-0">
                <User className="w-6 h-6" />
            </div>
            <div className="text-label font-bold tracking-[0.15em] uppercase mb-2 text-slate-400 group-hover:text-brand-accent transition-colors">
                {role}
            </div>
            <h4 className="text-subhead font-extrabold mb-3 tracking-tight text-slate-900">
                {name}
            </h4>
            <p className="text-sm leading-relaxed font-medium break-keep max-w-xs text-slate-500 mt-auto">
                {desc}
            </p>
        </div>
    </motion.div>
);

const Organization = () => {
    const professor = { role: "지도교수", name: "이상곤 교수", desc: '"데이터와 기획력을 바탕으로 세상을 변화시킬 실무형 인재들의 요람"' };
    const labLead = { role: "랩실장", name: "김예진", desc: "운영 총괄 및 방향 설정, 회계 투명성 유지" };
    const members = [
        { role: "부랩실장", name: "지근학", desc: "구성원 소통, 갈등 관리 및 홈페이지 운영" },
        { role: "공모전 담당", name: "김태우", desc: "팀 매칭, 일정 파악 및 공모전 완주율 관리" },
        { role: "스터디 담당", name: "송재호", desc: "주제 기획, 리더 배정 및 산출물 완성도 관리" },
        { role: "일정·행사 담당", name: "김나경", desc: "네트워킹 일정 기획, 회의록 작성" }
    ];

    const location = useLocation();
    const [activeTab, setActiveTab] = useState('구성');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        if (tab === 'vision') {
            setActiveTab('인재상');
        } else {
            setActiveTab('구성');
        }
    }, [location.search]);

    // Hand-drawn SVG lines
    const SvgLine = ({ pathD, width, height, viewBox, className }) => (
        <svg
            width={width}
            height={height}
            viewBox={viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <motion.path
                d={pathD}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                style={{ strokeDasharray: "4 4" }} // give it a little sketchy dashed look or use solid hand-drawn
            />
        </svg>
    );

    return (
        <div className="w-full bg-slate-50/50 pt-24 md:pt-32 pb-0 overflow-hidden">
            <Seo {...ROUTE_META['/organization']} />
            {/* Tabs Controller */}
            <div className="flex justify-center mb-10 pt-4 relative z-20">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('구성')}
                        className={`min-h-11 px-3 pb-4 font-bold text-lg md:text-xl transition-colors relative ${activeTab === '구성' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        구성
                        {activeTab === '구성' && (
                            <motion.div
                                layoutId="orgTabIndicator"
                                className="absolute bottom-[0px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('인재상')}
                        className={`min-h-11 px-3 pb-4 font-bold text-lg md:text-xl transition-colors relative ${activeTab === '인재상' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        인재상
                        {activeTab === '인재상' && (
                            <motion.div
                                layoutId="orgTabIndicator"
                                className="absolute bottom-[0px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                            />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === '구성' ? (
                    <motion.div
                        key="org"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full"
                    >
                        <div>
                            <div className="container mx-auto px-6">
                                {/* Title Section */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="text-center mb-20 max-w-4xl mx-auto"
                                >
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3] mb-6 break-keep">
                                        더 나은 환경과 문화를 만들기 위해<br className="hidden md:block" /> 고민하고 실행하는 <span className="text-brand-accent">운영진</span>을 소개합니다
                                    </h1>
                                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium break-keep">
                                        우리는 수평적인 관계 속에서 각자의 전문성을 발휘합니다.
                                    </p>
                                </motion.div>

                                {/* Organization Tree Container */}
                                <div className="max-w-7xl mx-auto relative pb-32 pt-8">

                                    {/* Level 1: 지도교수 (이상곤) */}
                                    <motion.div
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={staggerContainer}
                                        className="relative z-10 max-w-sm mx-auto flex flex-col items-center"
                                    >
                                        <div className="w-full">
                                            <GlassCard {...professor} />
                                        </div>
                                    </motion.div>

                                    {/* Level 2 Wrapper (지도교수 -> 랩실장) */}
                                    <div className="relative mt-16 md:mt-24">
                                        {/* Desktop SVG Connecting Line (Prof -> Lab Lead) */}
                                        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 pointer-events-none z-0" style={{ width: '40px', top: '-104px', height: '112px' }}>
                                            <svg className="w-full h-full text-brand-200" viewBox="0 0 40 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                <motion.path
                                                    d="M 20 0 C 35 30, 5 70, 20 100"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.0, ease: "easeInOut" }}
                                                />
                                            </svg>
                                        </div>

                                        {/* Mobile Connecting Line */}
                                        <div className="lg:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none z-0" style={{ width: '24px', top: '-72px', height: '88px' }}>
                                            <svg className="w-full h-full text-brand-200" viewBox="0 0 24 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                <motion.path
                                                    d="M 12 0 C 20 30, 4 70, 12 100"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.0 }}
                                                />
                                            </svg>
                                        </div>

                                        <motion.div
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, margin: "-50px" }}
                                            variants={staggerContainer}
                                            className="relative z-10 max-w-sm mx-auto flex flex-col items-center"
                                        >
                                            <div className="w-full">
                                                <GlassCard {...labLead} />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Level 3: Members */}
                                    <div className="relative mt-16 md:mt-32">
                                        {/* Desktop SVG Connecting Lines (Lab Lead -> Members) */}
                                        <div className="hidden lg:block absolute inset-0 pointer-events-none z-0" style={{ top: '-128px', height: '128px' }}>
                                            <svg
                                                className="w-full h-full text-brand-200"
                                                viewBox="0 0 1000 200"
                                                preserveAspectRatio="none"
                                            >
                                                {/* Center stem drop */}
                                                <motion.path
                                                    d="M 500 0 C 515 30, 485 50, 500 70"
                                                    stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                                                />
                                                {/* Left branch 1 (Far left) */}
                                                <motion.path
                                                    d="M 500 70 C 350 110, 150 120, 125 200"
                                                    stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                                                />
                                                {/* Left branch 2 (Inner left) */}
                                                <motion.path
                                                    d="M 500 70 C 450 100, 390 140, 375 200"
                                                    stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                                                />
                                                {/* Right branch 1 (Inner right) */}
                                                <motion.path
                                                    d="M 500 70 C 550 100, 610 140, 625 200"
                                                    stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                                                />
                                                {/* Right branch 2 (Far right) */}
                                                <motion.path
                                                    d="M 500 70 C 650 110, 850 120, 875 200"
                                                    stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                                                />
                                            </svg>
                                        </div>

                                        <motion.div
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, margin: "-50px" }}
                                            variants={staggerContainer}
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
                                        >
                                            {members.map((exec, idx) => (
                                                <div key={idx} className="flex flex-col justify-start w-full relative h-full">
                                                    {/* Mobile Connectors pointing to cards */}
                                                    <div className="lg:hidden absolute -top-16 left-1/2 transform -translate-x-1/2 w-8 h-16 pointer-events-none z-0">
                                                        <svg className="w-full h-full text-brand-200" preserveAspectRatio="none">
                                                            <motion.path
                                                                d="M 16 0 C 8 30, 24 70, 16 100"
                                                                stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                                initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.0, delay: idx * 0.1 }}
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="w-full h-full z-10 flex flex-col">
                                                        <GlassCard {...exec} />
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <section className="py-12 md:py-24 bg-gradient-to-b from-white to-slate-50 text-slate-900 relative overflow-hidden border-t border-slate-100">
                            <div className="absolute top-0 right-[-10%] w-[40%] pt-[40%] bg-brand-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob"></div>

                            <div className="container mx-auto px-6 relative z-10 text-center">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="max-w-2xl mx-auto"
                                >
                                    <h2 className="text-2xl md:text-4xl font-extrabold mb-10 leading-snug tracking-tight">
                                        이들이 모여 어떤 방식으로<br className="md:hidden" /> 일하는지 궁금하신가요?
                                    </h2>
                                    <Link
                                        to="/activities"
                                        className="inline-flex items-center bg-brand-accent text-white hover:bg-brand-700 px-8 py-4 rounded-full text-base font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        KBLs 활동 방식 보기
                                    </Link>
                                </motion.div>
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <motion.div
                        key="fit"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full"
                    >
                        <FitVisionTab onBack={() => setActiveTab('구성')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Organization;
