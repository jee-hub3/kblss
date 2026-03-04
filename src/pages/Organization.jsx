import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserCircle, Star, Target, Users, Calendar, Award, Code, Database, LayoutTemplate } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

const AnimatedVerticalLine = ({ delay = 0, height = "h-8 md:h-16" }) => (
    <div className={`relative w-px ${height} mx-auto overflow-hidden`}>
        <div className="absolute inset-0 bg-slate-200" />
        <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full bg-brand-400"
        />
        <motion.div
            animate={{ y: ['-100%', '500%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay }}
            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-brand-accent to-transparent opacity-80 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
        />
    </div>
);

const AnimatedHorizontalLine = ({ delay = 0, left = "10%", right = "10%" }) => (
    <div className="absolute top-0 h-px overflow-hidden" style={{ left, right }}>
        <div className="absolute inset-0 bg-slate-200" />
        <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, delay, ease: "easeInOut" }}
            className="absolute inset-0 bg-brand-400 origin-center"
        />
        <motion.div
            animate={{ opacity: [0, 1, 0], scaleX: [0, 1.2] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeOut", delay: delay + 0.5 }}
            className="absolute inset-0 bg-brand-accent opacity-60 origin-center shadow-[0_0_15px_rgba(37,99,235,0.6)]"
        />
    </div>
);

const NodeCard = ({ title, role, desc, icon: Icon, delay = 0, tags = [] }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full"
    >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-300 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

        <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-14 h-14 bg-slate-50 text-brand-accent rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-50 transition-colors">
                {Icon ? <Icon className="w-7 h-7" /> : <UserCircle className="w-8 h-8 text-slate-400" />}
            </div>
            {role && <span className="text-xs font-bold text-brand-accent tracking-wider uppercase mb-1 bg-brand-50 px-2 py-1 rounded-full">{role}</span>}
            <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed break-keep">{desc}</p>

            {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-slate-50 w-full">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    </motion.div>
);

const Organization = () => {
    const executives = [
        { role: "랩실장", name: "김예진", desc: "운영 총괄 및 방향 설정, 회계 투명성 유지", icon: Star },
        { role: "부랩실장", name: "지근학", desc: "구성원 소통, 갈등 관리 및 홈페이지 운영", icon: Users },
        { role: "공모전 담당", name: "김태우", desc: "팀 매칭, 일정 파악 및 공모전 완주율 관리", icon: Award },
        { role: "스터디 담당", name: "송재호", desc: "주제 기획, 리더 배정 및 산출물 완성도 관리", icon: Target },
        { role: "일정·행사 담당", name: "김나경", desc: "네트워킹 일정 기획, 회의록 작성", icon: Calendar },
    ];

    const members = [
        { dream: "데이터로 세상을 읽는 눈" },
        { dream: "0에서 1을 만드는 서비스 기획" },
        { dream: "무결점 백엔드 아키텍트" },
        { dream: "사람의 마음을 움직이는 PM" },
        { dream: "숫자 너머의 인사이트를 찾는 분석가" },
        { dream: "유저가 사랑하는 인터페이스 설계" },
        { dream: "데이터 기반 마케팅 전략가" },
        { dream: "통계로 미래를 예측하는 사이언티스트" },
        { dream: "코드로 가치를 창조하는 개발자" },
        { dream: "아이디어를 현실로 바꾸는 기획자" },
    ];

    return (
        <div className="w-full bg-slate-50/50 pt-32 pb-0">
            <div className="container mx-auto px-6">

                {/* Title Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-24"
                >
                    <span className="text-brand-accent font-bold tracking-widest uppercase mb-4 block text-sm">Organization</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        탄탄한 체계가 <br className="md:hidden" />압도적인 성장을 만듭니다.
                    </h1>
                </motion.div>

                {/* Tree Structure */}
                <div className="max-w-7xl mx-auto flex flex-col items-center pb-32">

                    {/* Level 1: Core */}
                    <div className="w-full max-w-sm px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-3xl shadow-md border-2 border-slate-100 p-8 text-center relative overflow-hidden group hover:border-brand-300 transition-colors z-10"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-brand-accent">
                                <UserCircle className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">홍길동 교수</h3>
                            <p className="text-brand-accent font-semibold text-sm mb-4">(현) OO대학교 경영학과 교수</p>
                            <p className="text-slate-600 italic text-sm leading-relaxed px-4 break-keep">
                                "데이터와 기획력을 바탕으로 세상을 변화시킬 실무형 인재들의 요람"
                            </p>
                        </motion.div>
                    </div>

                    <AnimatedVerticalLine delay={0.2} height="h-10 md:h-16" />

                    {/* Level 2: Executives */}
                    <div className="w-full relative px-2 md:px-0">
                        {/* Desktop Horizontal Connecting Line */}
                        <div className="hidden md:block">
                            <AnimatedHorizontalLine delay={0.4} left="10%" right="10%" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 lg:gap-6 relative">
                            {executives.map((exec, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="hidden md:block">
                                        {/* Vertical drops from horizontal line on desktop */}
                                        <AnimatedVerticalLine delay={0.6 + (idx * 0.1)} height="h-6 md:h-10" />
                                    </div>
                                    {/* Mobile connecting lines between stacked cards */}
                                    <div className="md:hidden w-full flex justify-center pb-6">
                                        {idx > 0 && <AnimatedVerticalLine delay={0.1} height="h-8" />}
                                    </div>
                                    <NodeCard
                                        title={exec.name}
                                        role={exec.role}
                                        desc={exec.desc}
                                        icon={exec.icon}
                                        delay={0.8 + (idx * 0.1)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connect Executives to Members */}
                    <div className="w-full mt-6 md:mt-0 md:-mt-6 relative z-0 flex flex-col items-center">
                        <div className="md:hidden">
                            <AnimatedVerticalLine delay={0.1} height="h-16" />
                        </div>
                        <div className="hidden md:block">
                            <AnimatedVerticalLine delay={1.4} height="h-20" />
                        </div>
                    </div>

                    {/* Level 3: Members — Dream Pill Cluster */}
                    <div className="w-full max-w-5xl relative px-4 md:px-0 mt-4 md:mt-0">
                        <div className="text-center mb-10 relative z-10 bg-slate-50 py-2">
                            <h3 className="text-brand-700 font-bold bg-brand-50 inline-block px-4 py-1.5 rounded-full text-sm">연구원 및 부원</h3>
                        </div>

                        <div className="hidden md:block">
                            <AnimatedHorizontalLine delay={1.6} left="5%" right="5%" />
                        </div>

                        {/* Dream Pill Cluster */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={staggerContainer}
                            className="flex flex-wrap justify-center gap-3 pt-8"
                        >
                            {members.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeInUp}
                                    className="group inline-flex items-center gap-2 bg-white px-5 py-3 rounded-full border border-slate-150 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-300 cursor-default"
                                >
                                    <span className="text-brand-accent text-sm">✦</span>
                                    <span className="font-semibold text-slate-700 text-sm whitespace-nowrap">{m.dream}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* 4. Bottom CTA */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                {/* Subtle mesh/pulse effects for the dark background */}
                <div className="absolute top-0 right-[-10%] w-[40%] pt-[40%] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-10 leading-snug">
                            이들이 모여 어떤 방식으로 일하는지 궁금하신가요?
                        </h2>
                        <Link
                            to="/activities"
                            className="inline-flex items-center bg-brand-accent text-white hover:bg-blue-500 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            KBLs 활동 방식 보기 <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default Organization;
