import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, Share2, Users, CheckCircle, Search, LineChart, LayoutTemplate, Rocket, Check, ChevronRight, Wrench, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { fadeInUp, staggerContainer, tabPanel } from '../lib/motion';

const DnaCard = ({ title, desc, icon: Icon }) => (
    <div
        className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-900 group-hover:scale-150 transition-transform duration-700">
            <Icon className="w-48 h-48" />
        </div>
        <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-50 text-brand-accent rounded-2xl flex items-center justify-center mb-8">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">{title}</h3>
            <p className="text-copy text-slate-600 font-medium">{desc}</p>
        </div>
    </div>
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
        {/* 경로 위를 도는 점. framer의 rAF 무한 루프(cx 애니메이션)는 화면 밖에서도
            메인스레드에 얹히고 reduced-motion에도 잡히지 않아, hero-blob과 같은
            결정으로 CSS 키프레임(.path-dot, index.css)에 이식했다 — 시각 결과 동일. */}
        <circle className="path-dot" cx="50" cy="50" r="6" fill="#2563eb" />
    </svg>
);

/* 증거 연출(motion.js 참조): 사이클 노드는 처음부터 놓여 있고(slate=아직),
   경로 선이 지나가는 순서대로 켜진다. 마지막 '최종 완주 & 회고'만 accent
   채움 — 이 사이클의 지표는 완주이고, 완료 색은 brand accent 하나다.
   색 전환은 CSS transition-colors(탭·hover와 같은 계열)로 하고
   (기준 4항: framer·키프레임은 transform·opacity 한정), 시차는
   transitionDelay로 AnimatedPath의 1.5s 그리기에 맞춘다. */
const ProcessNode = ({ title, lit, delay, isFinal }) => (
    <div
        style={lit ? { transitionDelay: `${delay}s` } : undefined}
        className={`relative z-10 flex flex-col items-center px-4 md:px-6 py-4 rounded-full border-2 shadow-md min-w-0 md:min-w-[200px] w-full md:w-auto transition-colors duration-300
            ${lit
                ? (isFinal ? 'bg-brand-accent border-brand-accent' : 'bg-white border-brand-100')
                : 'bg-white border-slate-200'}`}
    >
        <div
            style={lit ? { transitionDelay: `${delay}s` } : undefined}
            className={`font-bold whitespace-nowrap text-base transition-colors duration-300 ${lit ? (isFinal ? 'text-white' : 'text-slate-800') : 'text-slate-500'}`}
        >
            {title}
        </div>
    </div>
);

/* 모바일 세로 연결선 — 데스크톱 AnimatedPath의 대역. slate 트랙(아직) 위로
   accent 채움이 위→아래로 내려온다(transform 전용, 기준 4항 준수). */
const CycleConnector = ({ lit, delay }) => (
    <div className="md:hidden w-1 h-8 rounded-full bg-slate-200 overflow-hidden">
        <div
            style={lit ? { transitionDelay: `${delay}s` } : undefined}
            className={`w-full h-full bg-brand-accent origin-top transition-transform duration-300 ${lit ? 'scale-y-100' : 'scale-y-0'}`}
        />
    </div>
);

const Activities = () => {
    const [activeTab, setActiveTab] = useState(0);

    // 증거 연출 트리거 — 보드가 뷰포트에 들어오면 한 번만 켠다.
    // AnimatedPath(선 그리기)의 whileInView와 같은 margin이라 함께 시작한다.
    const cycleRef = useRef(null);
    const cycleLit = useInView(cycleRef, { once: true, margin: '-100px' });
    const mvpRef = useRef(null);
    const mvpLit = useInView(mvpRef, { once: true, margin: '-80px' });

    // 스터디는 학기마다 부원 수요조사로 개설된다 — 고정 커리큘럼이 아니라
    // "주제 영역"만 안내한다(개별 스터디를 나열하면 그 학기에 안 열렸을 때
    // 약속을 깬 것이 된다 — 오너 결정). 후보 주제는 아래 별도 라벨로 구분.
    // 갱신 주기: 모집 시즌 전 1회 — docs/OPERATIONS.md 점검 항목 참고.
    const studyTabs = [
        { title: "데이터 분석", keys: ["#데이터분석", "#SQL·Python"], desc: "실제 데이터를 가공하고 인사이트를 도출하는 SQL 및 파이썬 기반 데이터 분석 스터디입니다.", icon: LineChart },
        { title: "서비스 기획", keys: ["#서비스기획", "#유저리서치"], desc: "유저 리서치부터 와이어프레임 설계까지, 고객 중심의 서비스 구축 과정을 학습합니다.", icon: LayoutTemplate },
        { title: "툴 활용", keys: ["#Notion", "#Figma"], desc: "노션·피그마 등 협업 도구를 실제 프로젝트 흐름 속에서 다루며 팀의 생산성을 끌어올립니다.", icon: Wrench },
        { title: "AI 활용·트렌드", keys: ["#AI활용", "#AI트렌드"], desc: "생성형 AI 프롬프트 활용을 익히고, AI 저널과 리포트를 함께 읽고 토의하며 흐름을 따라잡습니다.", icon: Sparkles }
    ];

    return (
        <div className="w-full bg-white pt-32 pb-32">
            <Seo {...ROUTE_META['/activities']} />

            {/* 1. Hero Section — 페이지 진입 연출(마운트 1회). 스크롤 리빌이 아니므로
                whileInView 대신 animate를 쓴다(Portfolio 히어로와 같은 방식). */}
            <section className="container mx-auto px-6 mb-32 relative">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-4xl text-left"
                >
                    {/* 빈 stagger 슬롯(내용 없는 motion.div)은 h1 등장을 한 박자 늦추는
                        데드 코드라 제거했다. */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3] mb-6 break-keep"
                    >
                        <span className="text-brand-accent">KBLs만의 일하는 방식</span>을 배웁니다
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        className="text-sm md:text-base text-slate-600 leading-relaxed font-medium break-keep max-w-3xl"
                    >
                        치열하게 고민하고, 투명하게 공유하며, 확실한 결과물로 증명하는 <br className="hidden md:block" />KBLs의 성장 문화를 소개합니다.
                    </motion.p>
                </motion.div>
            </section>

            {/* 2. Our Culture DNA */}
            <section className="bg-slate-50 py-12 md:py-24 rounded-[3rem] mx-4 md:mx-8 mb-12 md:mb-24">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="mb-16 md:mb-24 text-center">
                        <h2 className="text-heading font-extrabold text-slate-900 mb-6">Our Culture DNA</h2>
                        <p className="text-lg text-slate-500">KBLs를 움직이는 3가지 핵심 동력</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <DnaCard
                            icon={Share2}
                            title="투명한 공유"
                            desc="모든 회의록, 진행 상황, 트러블슈팅은 노션(Notion)에 투명하게 기록되고 공유됩니다."
                        />
                        <DnaCard
                            icon={Users}
                            title="시스템 기반 협업"
                            desc="개인의 의지에만 의존하지 않습니다. 임원-팀장-팀원으로 이어지는 명확한 역할 분담이 무임승차를 방지합니다."
                        />
                        <DnaCard
                            icon={CheckCircle}
                            title="결과물 증명"
                            desc="배움에서 멈추지 않고 기획서, MVP, 자격증 등 눈에 보이는 실질적인 산출물을 반드시 도출합니다."
                        />
                    </div>
                </div>
            </section>

            {/* 3. Culture in Action 01 - 공모전 */}
            <section className="container mx-auto px-6 mb-32 md:mb-48">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="lg:w-1/3">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">한계를 넘는 실전 경험,<br />체계적인 공모전 완주</h2>
                        <p className="text-copy text-slate-600">
                            KBLs의 공모전은 팀 빌딩부터 다릅니다. 전체 현황을 점검하는 랩실 임원과 실무를 이끄는 팀장의 이중 관리 시스템을 통해 중도 포기 리스크를 차단합니다.
                        </p>
                    </div>

                    {/* 증거 연출: 경로 선(보호 연출)이 그려지는 순서를 따라 노드가
                        켜진다 — 시작이 아니라 완주까지 가는 사이클을 그대로 보여준다.
                        점등 시차는 AnimatedPath 1.5s(easeInOut) 위 노드 위치의 근사값. */}
                    <div ref={cycleRef} className="lg:w-2/3 w-full relative min-h-[400px] md:h-[400px] flex items-center bg-slate-50 rounded-3xl p-8 overflow-hidden">
                        {/* SVG Path connecting the nodes */}
                        <AnimatedPath />

                        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 py-8 md:py-0">
                            <ProcessNode title="조직적 팀 빌딩" lit={cycleLit} delay={0.1} />
                            <CycleConnector lit={cycleLit} delay={0.4} />
                            <ProcessNode title="투명한 과정 공유" lit={cycleLit} delay={0.75} />
                            <CycleConnector lit={cycleLit} delay={1.05} />
                            <ProcessNode title="최종 완주 & 회고" lit={cycleLit} delay={1.4} isFinal />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Culture in Action 02 - MVP */}
            <section className="bg-slate-900 py-12 md:py-24 rounded-[3rem] mx-4 md:mx-8 mb-12 md:mb-24 text-white relative overflow-hidden">
                {/* Decorative ambient background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-brand-600/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="mb-20 text-center">
                        <h2 className="text-heading font-extrabold mb-6 leading-tight">주도적 문제 해결,<br />서비스 기획 및 해커톤</h2>
                        <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            누군가 던져준 과제가 아닌, 세상의 문제를 스스로 발굴합니다. 실제 데이터를 분석하여 근거를 찾고, 아이디어를 최소 기능 제품(MVP)으로 구현하여 실무 기획력을 기릅니다.
                        </p>
                    </div>

                    {/* Stepper — 증거 연출: 카드 페이드는 걷어내고, 연결선이 accent로
                        채워지며 그 선이 닿는 순서대로 원형 노드가 켜진다(slate=아직).
                        선 i의 채움이 0.8s이므로 노드 i+1은 그 끝에 맞춰 점등한다.
                        어두운 배경 위 점등 색은 brand-accent-on-dark(대비 규칙). */}
                    <div ref={mvpRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: Search, title: "문제 정의 & 리서치", desc: "사용자의 렌즈로 진짜 문제를 탐색" },
                            { icon: LineChart, title: "데이터 기반 기획", desc: "검증된 논리를 통한 솔루션 도출" },
                            { icon: LayoutTemplate, title: "프로토타이핑", desc: "Figma를 활용한 화면 구조 설계" },
                            { icon: Rocket, title: "MVP 개발 & 테스트", desc: "최소 기능 구현을 통한 가설 검증" },
                        ].map((step, idx) => {
                            const igniteDelay = idx === 0 ? 0.3 : (idx - 1) * 0.2 + 1.3;
                            return (
                                <div key={idx} className="relative">
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
                                        <div
                                            style={mvpLit ? { transitionDelay: `${igniteDelay}s` } : undefined}
                                            className={`w-14 h-14 rounded-full border-2 transition-colors duration-300 flex items-center justify-center mb-6 shadow-xl ${mvpLit ? 'bg-brand-900 border-brand-accent-on-dark' : 'bg-slate-800 border-slate-700'}`}
                                        >
                                            <step.icon
                                                style={mvpLit ? { transitionDelay: `${igniteDelay}s` } : undefined}
                                                className={`w-6 h-6 transition-colors duration-300 ${mvpLit ? 'text-brand-accent-on-dark' : 'text-brand-400'}`}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-sm font-bold mb-4">
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed px-4">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 5. Culture in Action 03 - 스터디 */}
            <section className="container mx-auto px-6 mb-32 md:mb-48">
                <div className="text-center mb-16">
                    <h2 className="text-heading font-extrabold text-slate-900 mb-6 leading-tight">성장의 뼈대를 세우는<br />체계적인 지식 공유</h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        단발성 겉핥기식 스터디를 지양합니다. 스터디는 매 학기 부원 수요조사를 통해 개설되며, 스터디 리더의 주도하에 '결과물 도출'을 목표로 밀도 있게 진행됩니다.
                    </p>
                </div>

                {/* Custom Tab / Sliding Card Design */}
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 bg-slate-50 p-4 md:p-8 rounded-[2rem] border border-slate-100">
                    {/* Tab Headers */}
                    <div className="flex flex-row md:flex-col md:w-1/3 gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {studyTabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`flex items-center text-left p-4 rounded-xl transition-all press focus-ring min-w-[160px] md:min-w-0 font-bold text-base md:text-lg
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
                                {...tabPanel(1)}
                                className="bg-white w-full p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100"
                            >
                                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                                    {React.createElement(studyTabs[activeTab].icon, { className: "w-8 h-8 text-brand-accent" })}
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{studyTabs[activeTab].title} 스터디</h3>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
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

                {/* 후보 주제 — 운영 중인 탭 본문과 한눈에 구분되는 별도 라벨(오너 결정).
                    메시지는 "네 수요가 반영된다"이지 "이걸 해준다"가 아니다.
                    특히 국가공인 자격(ADsP 등)을 운영 중인 것처럼 쓰지 않는다. */}
                <div className="max-w-5xl mx-auto mt-6 px-2">
                    <p className="text-label text-slate-600 leading-relaxed break-keep border border-dashed border-slate-300 rounded-xl px-5 py-4 bg-white">
                        <span className="inline-block font-bold text-slate-700 bg-slate-100 rounded-md px-2 py-0.5 mr-2">주제 예시</span>
                        부원이 제안할 수 있는 주제 예시 — ADsP·빅데이터분석기사 자격증 대비, AI 트렌드 리포트 토의 등.
                        개설 여부는 매 학기 수요조사로 정해집니다.
                    </p>
                </div>
            </section>

            {/* 6. Bottom CTA */}
            <section className="py-12 md:py-24 bg-gradient-to-b from-white to-brand-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-extrabold mb-10 leading-snug text-slate-900">
                            이러한 문화 속에서 우리는<br />어떤 결과를 만들어 냈을까요?
                        </h2>
                        {/* hover 색은 하드코딩(blue-700) 대신 브랜드 토큰 — Button.jsx와 동일 */}
                        <Link
                            to="/portfolio"
                            className="inline-flex items-center bg-brand-accent hover:bg-brand-accent-hover text-white px-8 py-4 rounded-full text-base font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 press focus-ring"
                        >
                            KBLs 산출물 확인하기
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Activities;
