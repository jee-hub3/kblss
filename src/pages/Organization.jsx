import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import FitVisionTab from '../components/FitVisionTab';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const AnimatedVerticalLine = () => (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-slate-200" style={{ zIndex: 0 }}>
        <motion.div
            className="w-full bg-brand-accent h-full origin-top"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Pulse effect */}
        <motion.div
            className="w-[4px] h-[30px] bg-white rounded-full absolute top-0 -left-[1px] shadow-[0_0_10px_2px_rgba(37,99,235,0.5)]"
            initial={{ y: 0, opacity: 0 }}
            whileInView={{ opacity: 1 }}
            animate={{ y: ["0%", "2000%"] }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity, delay: 1 }}
        />
    </div>
);

const NodeItem = ({ role, name, desc, delay = 0, isProf = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay }}
        className="relative z-10 w-full max-w-sm mx-auto my-8 flex flex-col items-center group"
    >
        <div className={`p-6 rounded-3xl shadow-lg border relative transition-all duration-300 w-full text-center ${isProf ? 'bg-slate-900 border-slate-800 text-white shadow-2xl scale-105' : 'bg-white border-slate-100 hover:border-brand-accent hover:shadow-xl'}`}>
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${isProf ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-accent transition-colors'}`}>
                <User className="w-4 h-4" />
            </div>
            <div className={`text-xs font-bold tracking-widest uppercase mb-2 mt-2 ${isProf ? 'text-brand-300' : 'text-slate-400'}`}>{role}</div>
            <h4 className={`text-2xl font-extrabold mb-3 tracking-tight ${isProf ? 'text-white' : 'text-slate-900'}`}>{name}</h4>
            <p className={`text-sm leading-relaxed font-medium break-keep ${isProf ? 'text-slate-300 italic' : 'text-slate-500'}`}>{desc}</p>
        </div>
    </motion.div>
);

const Organization = () => {
    const executives = [
        { role: "랩실장", name: "김예진", desc: "운영 총괄 및 방향 설정, 회계 투명성 유지" },
        { role: "부랩실장", name: "지근학", desc: "구성원 소통, 갈등 관리 및 홈페이지 운영" },
        { role: "공모전 담당", name: "김태우", desc: "팀 매칭, 일정 파악 및 공모전 완주율 관리" },
        { role: "스터디 담당", name: "송재호", desc: "주제 기획, 리더 배정 및 산출물 완성도 관리" },
        { role: "일정·행사 담당", name: "김나경", desc: "네트워킹 일정 기획, 회의록 작성" },
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

    return (
        <div className="w-full bg-slate-50/50 pt-32 pb-0 overflow-hidden">
            {/* Tabs Controller - Styled like Apply.jsx but centered, without bottom border */}
            <div className="flex justify-center mb-10 pt-4 relative z-20">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('구성')}
                        className={`pb-4 font-bold text-xl transition-colors relative ${activeTab === '구성' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
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
                        className={`pb-4 font-bold text-xl transition-colors relative ${activeTab === '인재상' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
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
                        <div className="container mx-auto px-6">
                            {/* Title Section - Redesigned Editorial Typography */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="text-center mb-28 max-w-4xl mx-auto"
                            >
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.3] break-keep">
                                    더 나은 환경과 문화를 만들기 위해<br className="hidden md:block" /> 고민하고 실행하는 <span className="text-brand-accent">운영진</span>을 소개합니다.
                                </h1>
                                <p className="mt-8 text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed break-keep">
                                    우리는 수평적인 관계 속에서 각자의 전문성을 발휘합니다.
                                </p>
                            </motion.div>

                            {/* Connected System Tree */}
                            <div className="max-w-4xl mx-auto flex flex-col items-center pb-32 relative">
                                <AnimatedVerticalLine />

                                {/* Level 1: Core */}
                                <div className="w-full">
                                    <NodeItem
                                        role="지도교수"
                                        name="홍길동 교수"
                                        desc={'"데이터와 기획력을 바탕으로 세상을 변화시킬 실무형 인재들의 요람"'}
                                        delay={0.2}
                                        isProf={true}
                                    />
                                    <div className="text-center mt-2 mb-8 relative z-10 text-brand-600 font-bold text-sm tracking-widest">(현) OO대학교 경영학과 교수</div>
                                </div>

                                {/* Level 2: Executives connected sequentially */}
                                <div className="w-full mt-8">
                                    {executives.map((exec, idx) => (
                                        <NodeItem
                                            key={idx}
                                            role={exec.role}
                                            name={exec.name}
                                            desc={exec.desc}
                                            delay={0.4 + (idx * 0.15)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-[-10%] w-[40%] pt-[40%] bg-brand-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>

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
                                        className="inline-flex items-center bg-brand-accent text-white hover:bg-blue-600 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        KBLs 활동 방식 보기 <ArrowRight className="ml-2 w-5 h-5" />
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
