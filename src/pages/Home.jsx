import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { ArrowRight, Trophy, Users, Lightbulb, Rocket } from 'lucide-react';

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

const Home = () => {
    return (
        <div className="w-full">
            {/* ═══════════════════════════════════════════
                1. Hero Section — 최초 중앙 정렬 테마로 복구
            ═══════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-mesh-gradient">
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU5LjUgNjBoLS41VjU5LjVoLjVWMjB6TTAgNjBoLjV2LS41SDBWMjB6TTAgMEgwdjAuNWguNVYwem01OS41IDB2LjVoLjVWMHpoLS41eiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjE1Ii8+PC9zdmc+')]"></div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-10 inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm"
                    >
                        <span className="text-sm font-semibold text-brand-800">2026년 KBLs 신규 회원 모집중</span>
                    </motion.div>

                    {/* Centered large typography — slightly smaller than original 8xl */}
                    <motion.h1
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]"
                    >
                        <motion.span variants={fadeInUp} className="block">
                            아이디어를 <span className="relative inline-block"><span className="relative z-10 font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">실행</span><span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-100 -z-0 transform -rotate-2"></span></span>으로,
                        </motion.span>
                        <motion.span variants={fadeInUp} className="block mt-2">
                            사람을 <span className="relative inline-block"><span className="relative z-10 font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">연결</span><span className="absolute bottom-1 left-0 w-full h-3 bg-purple-100 -z-0 transform rotate-1"></span></span>로
                        </motion.span>
                        <motion.span variants={fadeInUp} className="block mt-4 text-3xl md:text-4xl text-slate-700 font-semibold tracking-normal">
                            우리가 함께 성장을 증명하는 곳.
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        세상에는 수많은 문제들이 있습니다.<br className="hidden md:block" />
                        중요한 것은, 행동하고 실천하며 해결책을 만들어가는 것입니다
                    </motion.p>
                </div>
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

                        <h3 className="text-4xl md:text-5xl font-bold mb-10 text-slate-900">
                            <span className="font-extrabold text-brand-800 tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">K</span>ey <span className="font-extrabold text-brand-800 tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">B</span>ridge <span className="font-extrabold text-brand-800 tracking-tighter mix-blend-multiply drop-shadow-[0_2px_10px_rgba(37,99,235,0.2)]">L</span>eaders
                        </h3>
                        <p className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed tracking-tight">
                            KBLs는 다양한 전공과 배경을 가진 사람들이 협력하며 프로젝트를 진행하는 연구실 입니다 <br className="hidden md:block" /><span className="text-slate-500">단순한 프로젝트 팀이 아니라, 새로운 아이디어를 실현하고 실행력을 키우는 공간입니다</span>
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
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.2] tracking-tight"
                                style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
                            >
                                사람을 연결하고,<br />
                                <span className="text-brand-accent">함께 성장합니다</span>
                            </h2>
                            <p
                                className="mt-8 text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg"
                                style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
                            >
                                개인의 아이디어가 팀의 실행력을 만나면, 세상을 바꿀 수 있는 힘이 됩니다. KBLs는 그 연결의 다리(Bridge)를 놓습니다
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
                                <div className="w-full aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-lg">
                                        Team Photo
                                    </div>
                                </div>

                                {/* Floating overlap panel — bottom-left offset */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="absolute -bottom-8 -left-6 lg:-left-16 w-[60%] aspect-[3/2] rounded-2xl bg-gradient-to-br from-brand-accent/10 to-indigo-100 border border-white shadow-xl overflow-hidden"
                                >
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-sm">
                                        Workshop Scene
                                    </div>
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
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">What We Do</h2>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                이론에서 멈추지 않습니다<br />KBLs에서는 이런 실전 경험들이 당신의 일상이 됩니다
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
                                <h4 className="text-2xl font-bold mb-4 text-slate-900">{item.title}</h4>
                                <p className="text-slate-500 leading-relaxed text-lg">{item.desc}</p>
                                <div className="mt-6 h-px w-12 bg-slate-200 group-hover:w-20 group-hover:bg-brand-accent transition-all duration-500" />
                            </motion.div>
                        ))}
                    </div>

                    <Link to="/activities" className="md:hidden mt-12 w-full inline-flex justify-center items-center text-brand-accent font-semibold group">
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
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">KBLs in Numbers</h2>
                        <p className="text-xl text-slate-500">단순한 스터디를 넘어, 숫자가 증명하는 우리의 압도적인 몰입</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                        {[
                            { num: 15, suffix: "건+", label: "누적 공모전 수상" },
                            { num: 24, suffix: "개+", label: "완성된 MVP 및 기획서" },
                            { num: 95, suffix: "%", label: "공모전 및 스터디 완주율" },
                            { num: 40, suffix: "명+", label: "함께 성장한 동문 네트워크" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-indigo-500 mb-4 inline-flex items-center">
                                    <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce />
                                    <span>{stat.suffix}</span>
                                </div>
                                <div className="text-lg text-slate-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
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
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Featured Portfolio</h2>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                치열한 고민 끝에 탄생한 산출물, <br />당신의 다음 포트폴리오가 될 수 있습니다
                            </p>
                        </div>
                        <Link to="/portfolio" className="hidden md:inline-flex items-center text-brand-accent font-semibold hover:text-blue-800 transition-colors group">
                            전체 포트폴리오 확인하기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[1, 2, 3].map((item, i) => {
                            const pfLinks = ["#eco-link", "#congestion", "#k-campus"];
                            return (
                                <motion.a
                                    href={pfLinks[i]} target="_blank" rel="noopener noreferrer"
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i * 0.15 }}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden mb-6 relative group-hover:scale-[1.02] transition-transform duration-500">
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-lg">
                                            Project Image {item}
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-bold mb-2 text-slate-900 group-hover:text-brand-accent transition-colors">우수 기획서 프로젝트 {item}</h4>
                                    <p className="text-slate-500 text-lg">UX/UI 기획 & 데이터 분석</p>
                                </motion.a>
                            );
                        })}
                    </div>

                    <Link to="/portfolio" className="md:hidden mt-8 w-full inline-flex justify-center items-center text-brand-accent font-semibold group">
                        전체 포트폴리오 확인하기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                6. Who We Are Looking For
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-b from-white to-slate-50">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Who We Are Looking For</h2>
                        <p className="text-xl text-slate-600">완벽하지 않아도 좋습니다. KBLs는 이런 열정을 가진 분을 기다립니다</p>
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
                                className="flex items-center bg-white px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-shadow text-2xl font-bold text-slate-800 border border-slate-100"
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
                    >
                        <Link to="/fit-vision" className="inline-flex items-center text-lg text-slate-600 hover:text-brand-accent font-semibold transition-colors group">
                            내가 KBLs가 찾는 인재일까? 핏(Fit) 확인하기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                7. Bottom CTA
            ═══════════════════════════════════════════ */}
            <section className="py-32 bg-gradient-to-b from-slate-50 via-brand-accent to-brand-accent text-white relative overflow-hidden">
                <div className="absolute top-0 right-[-10%] w-[50%] pt-[50%] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] pt-[50%] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
                            스스로 문제를 정의하고<br />해결하고 싶다면,<br />KBLs와 함께하세요
                        </h2>
                        <Link to="/apply" className="inline-block bg-white text-brand-accent hover:bg-slate-50 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                            KBLs 합류하기
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
