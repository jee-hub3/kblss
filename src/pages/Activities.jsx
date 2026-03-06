import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Share2, Users, CheckCircle, Search, LineChart, LayoutTemplate, Rocket, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const DnaCard = ({ title, desc, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-900 group-hover:scale-150 transition-transform duration-700">
            <Icon className="w-48 h-48" />
        </div>
        <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-50 text-brand-accent rounded-2xl flex items-center justify-center mb-8">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">{title}</h3>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">{desc}</p>
        </div>
    </motion.div>
);

const AnimatedPath = () => (
    <svg className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 hidden md:block" style={{ zIndex: 0 }} viewBox="0 0 1000 100" preserveAspectRatio="none">
        <motion.path
            d="M 50 50 L 950 50"
            fill="transparent"
            stroke="#dbeafe"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Moving dot along the path */}
        <motion.circle
            r="6"
            fill="#2563eb"
            initial={{ cx: 50, opacity: 0 }}
            whileInView={{ opacity: 1 }}
            animate={{ cx: [50, 950] }}
            transition={{
                cx: { duration: 3, ease: "linear", repeat: Infinity },
                opacity: { duration: 0.5, delay: 0.5 }
            }}
            cy="50"
        />
    </svg>
);

const ProcessNode = ({ step, title, idx, total }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: idx * 0.3 + 0.5 }}
        className="relative z-10 flex flex-col items-center bg-white px-6 py-4 rounded-full border-2 border-brand-100 shadow-md min-w-[200px]"
    >

        <div className="text-slate-800 font-bold whitespace-nowrap text-lg">{title}</div>
    </motion.div>
);

const Activities = () => {
    const [activeTab, setActiveTab] = useState(0);

    const studyTabs = [
        { title: "데이터 분석", keys: ["#데이터분석", "#SQL"], desc: "실제 데이터를 가공하고 인사이트를 도출하는 SQL 및 파이썬 기반 데이터 분석 스터디입니다.", icon: LineChart },
        { title: "서비스 기획", keys: ["#서비스기획", "#Notion/Figma"], desc: "유저 리서치부터 와이어프레임 설계까지, 고객 중심의 서비스 구축 과정을 학습합니다.", icon: LayoutTemplate },
        { title: "AI 및 자격증", keys: ["#AI활용", "#ADsP자격증"], desc: "생성형 AI 인공지능 프롬프트 활용 및 실무 자격증 취득을 목표로 지식을 쌓습니다.", icon: CheckCircle }
    ];

    return (
        <div className="w-full bg-white pt-32 pb-32">

            {/* 1. Hero Section */}
            <section className="container mx-auto px-6 mb-32 relative">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="max-w-4xl text-left"
                >
                    <motion.div variants={fadeInUp} className="inline-block mb-6 relative">

                    </motion.div>
                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-8"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-indigo-500">KBLs만의 일하는 방식</span>을 배웁니다
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium max-w-3xl"
                    >
                        치열하게 고민하고, 투명하게 공유하며, 확실한 결과물로 증명하는 <br className="hidden md:block" />KBLs의 성장 문화를 소개합니다
                    </motion.p>
                </motion.div>
            </section>

            {/* 2. Our Culture DNA */}
            <section className="bg-slate-50 py-32 rounded-[3rem] mx-4 md:mx-8 mb-32">
                <div className="container mx-auto px-6 lg:px-12">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-16 md:mb-24 text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Our Culture DNA</h2>
                        <p className="text-xl text-slate-500">KBLs를 움직이는 3가지 핵심 동력</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <DnaCard
                            delay={0.1}
                            icon={Share2}
                            title="투명한 공유"
                            desc="모든 회의록, 진행 상황, 트러블슈팅은 노션(Notion)에 투명하게 기록되고 공유됩니다"
                        />
                        <DnaCard
                            delay={0.3}
                            icon={Users}
                            title="시스템 기반 협업"
                            desc="개인의 의지에만 의존하지 않습니다. 임원-팀장-팀원으로 이어지는 명확한 역할 분담이 무임승차를 방지합니다"
                        />
                        <DnaCard
                            delay={0.5}
                            icon={CheckCircle}
                            title="결과물 증명"
                            desc="배움에서 멈추지 않고 기획서, MVP, 자격증 등 눈에 보이는 실질적인 산출물을 반드시 도출합니다"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Culture in Action 01 - 공모전 */}
            <section className="container mx-auto px-6 mb-32 md:mb-48">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="lg:w-1/3"
                    >

                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">한계를 넘는 실전 경험,<br />체계적인 공모전 완주</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            KBLs의 공모전은 팀 빌딩부터 다릅니다. 전체 현황을 점검하는 랩실 임원과 실무를 이끄는 팀장의 이중 관리 시스템을 통해 중도 포기 리스크를 차단합니다
                        </p>
                    </motion.div>

                    <div className="lg:w-2/3 w-full relative min-h-[400px] md:h-[400px] flex items-center bg-slate-50 rounded-3xl p-8 overflow-hidden">
                        {/* SVG Path connecting the nodes */}
                        <AnimatedPath />

                        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 py-8 md:py-0">
                            <ProcessNode step="1" title="조직적 팀 빌딩" idx={0} />
                            <div className="md:hidden w-1 h-8 bg-brand-200" />
                            <ProcessNode step="2" title="투명한 과정 공유" idx={1} />
                            <div className="md:hidden w-1 h-8 bg-brand-200" />
                            <ProcessNode step="3" title="최종 완주 & 회고" idx={2} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Culture in Action 02 - MVP */}
            <section className="bg-slate-900 py-32 rounded-[3rem] mx-4 md:mx-8 mb-32 text-white relative overflow-hidden">
                {/* Decorative ambient background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-brand-600/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-20 text-center"
                    >

                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">주도적 문제 해결,<br />서비스 기획 및 해커톤</h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            누군가 던져준 과제가 아닌, 세상의 문제를 스스로 발굴합니다. 실제 데이터를 분석하여 근거를 찾고, 아이디어를 최소 기능 제품(MVP)으로 구현하여 실무 기획력을 기릅니다
                        </p>
                    </motion.div>

                    {/* Stepper Design */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: Search, title: "문제 정의 & 리서치", desc: "사용자의 렌즈로 진짜 문제를 탐색" },
                            { icon: LineChart, title: "데이터 기반 기획", desc: "검증된 논리를 통한 솔루션 도출" },
                            { icon: LayoutTemplate, title: "프로토타이핑", desc: "Figma를 활용한 화면 구조 설계" },
                            { icon: Rocket, title: "MVP 개발 & 테스트", desc: "최소 기능 구현을 통한 가설 검증" },
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.15 + 0.2 }}
                                className="relative group"
                            >
                                {/* Connecting lines for desktop */}
                                {idx < 3 && (
                                    <div className="hidden md:block absolute top-[28px] left-[50%] w-[calc(100%+2rem)] h-[2px] bg-slate-700">
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: idx * 0.2 + 0.5 }}
                                            className="absolute top-0 left-0 w-full h-full bg-brand-accent origin-left"
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:border-brand-accent group-hover:bg-brand-900 transition-colors flex items-center justify-center mb-6 shadow-xl">
                                        <step.icon className="w-6 h-6 text-brand-400 group-hover:text-brand-accent transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-sm font-bold mb-4">
                                        {idx + 1}
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed px-4">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Culture in Action 03 - 스터디 */}
            <section className="container mx-auto px-6 mb-32 md:mb-48">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >

                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">성장의 뼈대를 세우는<br />체계적인 지식 공유</h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        단발성 겉핥기식 스터디를 지양합니다. 학기 초 수요 조사를 통해 정규 커리큘럼을 세우고, 스터디 리더의 주도하에 '결과물 도출'을 목표로 밀도 있게 진행됩니다
                    </p>
                </motion.div>

                {/* Custom Tab / Sliding Card Design */}
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 bg-slate-50 p-4 md:p-8 rounded-[2rem] border border-slate-100">
                    {/* Tab Headers */}
                    <div className="flex flex-row md:flex-col md:w-1/3 gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {studyTabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`flex items-center text-left p-4 rounded-xl transition-all min-w-[200px] md:min-w-0 font-bold text-lg
                  ${activeTab === idx
                                        ? 'bg-white shadow-md text-brand-accent border border-brand-100'
                                        : 'bg-transparent text-slate-500 hover:bg-white/50 border border-transparent hover:border-slate-200'}`}
                            >
                                <tab.icon className={`w-5 h-5 mr-3 ${activeTab === idx ? 'text-brand-accent' : 'text-slate-400'}`} />
                                {tab.title}
                                {activeTab === idx && <ChevronRight className="w-5 h-5 ml-auto hidden md:block" />}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="md:w-2/3 md:pl-8 flex items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white w-full p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100"
                            >
                                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                                    {React.createElement(studyTabs[activeTab].icon, { className: "w-8 h-8 text-brand-accent" })}
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-900 mb-4">{studyTabs[activeTab].title} 스터디</h3>
                                <p className="text-xl text-slate-600 mb-8 leading-relaxed font-medium">
                                    {studyTabs[activeTab].desc.replace(/\.$/, '')}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {studyTabs[activeTab].keys.map((key, i) => (
                                        <span key={i} className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold tracking-wide">
                                            <Check className="w-4 h-4 mr-2 text-brand-400" />
                                            {key}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* 6. Bottom CTA */}
            <section className="py-24 bg-brand-accent text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-10 leading-snug">
                            이러한 문화 속에서 우리는<br />어떤 결과를 만들어 냈을까요?
                        </h2>
                        <Link
                            to="/portfolio"
                            className="inline-flex items-center bg-white text-brand-900 hover:bg-slate-50 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            KBLs 산출물 확인하기 <ArrowRight className="ml-2 w-5 h-5 text-brand-accent" />
                        </Link>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default Activities;
