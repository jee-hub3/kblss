import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, LineChart, LayoutTemplate, Rocket, Check, ChevronRight, Wrench, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { fadeInUp, staggerContainer, tabPanel, DUR, EASE_OUT, VIEWPORT_ONCE } from '../lib/motion';

/* ── 이 페이지의 골격 (오너 결정 2026-08-26) ─────────────────────────
   여기는 "문화 소개"가 아니라 "활동 소개"다. 공모전·자체 프로젝트·스터디
   세 축이 주인공이고, 세 축은 모두 같은 순서로 답한다:
     ① 무엇인가(정의) → ② 어떻게 진행되나(시각물) → ③ 무엇이 남나(산출물)
     → ④ 증거(Portfolio)
   축마다 레이아웃(밝은/어두운, 1단/탭)은 달라도 AxisHeader·AxisProcessIntro·
   AxisOutcome 세 조각은 공유한다. 축이 늘면 이 세 조각을 같은 순서로 채울 것.

   문화(구 'Our Culture DNA')는 세 축 아래 '운영 원칙' 밴드로 내려갔다 —
   활동의 근거로는 남되 헤드라인 자리는 활동에 내준다. 카드 껍데기와 아이콘을
   걷어낸 텍스트 밴드인 것도 같은 이유(강등의 시각적 신호)다.

   축 이름은 홈 What We Do와 같은 단어를 쓴다(공모전 / 자체 프로젝트 / 스터디).
   여기서 이름이 갈리면 홈에서 넘어온 방문자가 같은 축을 찾지 못한다. */

const AXES = [
    { id: 'activity-contest', no: '01', name: '공모전', line: '실제 기업·기관의 과제에 팀으로 도전해 완주합니다.' },
    { id: 'activity-project', no: '02', name: '자체 프로젝트', line: '우리가 찾은 문제를 MVP까지 직접 만듭니다.' },
    { id: 'activity-study', no: '03', name: '스터디', line: '필요한 역량을 부원이 직접 열고 함께 채웁니다.' },
];

/* ① 정의 — 축 번호·이름 / 제목 / 한 줄 정의. tone은 배경 명암만 가른다. */
const AxisHeader = ({ no, name, title, lead, tone = 'light' }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeInUp}
        className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
    >
        <div className="flex items-center justify-center gap-3 mb-6">
            <span className={tone === 'dark' ? 'text-label font-extrabold tracking-widest text-brand-accent-on-dark' : 'text-label font-extrabold tracking-widest text-brand-accent'}>{no}</span>
            <span aria-hidden="true" className={tone === 'dark' ? 'h-px w-6 bg-slate-600' : 'h-px w-6 bg-slate-300'} />
            <span className={tone === 'dark' ? 'text-label font-bold tracking-widest text-slate-300' : 'text-label font-bold tracking-widest text-slate-500'}>{name}</span>
        </div>
        <h2 className={tone === 'dark' ? 'text-heading font-extrabold mb-6 leading-tight text-white' : 'text-heading font-extrabold mb-6 leading-tight text-slate-900'}>{title}</h2>
        <p className={tone === 'dark' ? 'text-lg leading-relaxed break-keep text-slate-300' : 'text-lg leading-relaxed break-keep text-slate-600'}>{lead}</p>
    </motion.div>
);

/* ② 진행 — 아래 시각물이 무엇을 보여주는지 한 줄로 먼저 말한다. */
const AxisProcessIntro = ({ text, tone = 'light' }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeInUp}
        className="text-center max-w-3xl mx-auto mb-8 md:mb-10"
    >
        <p className={tone === 'dark' ? 'text-label font-extrabold tracking-widest mb-3 text-slate-400' : 'text-label font-extrabold tracking-widest mb-3 text-slate-500'}>이렇게 진행합니다</p>
        <p className={tone === 'dark' ? 'text-copy break-keep text-slate-300' : 'text-copy break-keep text-slate-600'}>{text}</p>
    </motion.div>
);

/* ③ 산출물 + ④ 증거 — 축마다 이 줄로 닫는다.
   칩 문구에는 "약속할 수 있는 것"만 적는다. 자격증처럼 개설·취득이 보장되지
   않는 항목은 넣지 않는다(아래 스터디 '주제 예시' 안내와 같은 기준). */
const AxisOutcome = ({ items, linkLabel, tone = 'light', className = '' }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeInUp}
        className={'mt-12 pt-8 border-t flex flex-col gap-6 md:flex-row md:items-center md:justify-between '
            + (tone === 'dark' ? 'border-slate-700 ' : 'border-slate-200 ') + className}
    >
        <div className="flex flex-wrap items-center gap-2.5">
            <span className={tone === 'dark' ? 'text-label font-extrabold tracking-widest mr-1 text-slate-400' : 'text-label font-extrabold tracking-widest mr-1 text-slate-500'}>남는 것</span>
            {items.map((item) => (
                <span
                    key={item}
                    className={'inline-flex items-center rounded-lg border px-3 py-1.5 text-label font-bold '
                        + (tone === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700')}
                >
                    {item}
                </span>
            ))}
        </div>
        <Link
            to="/portfolio"
            className={'group inline-flex items-center shrink-0 font-bold press focus-ring rounded-lg transition-colors '
                + (tone === 'dark' ? 'text-brand-accent-on-dark hover:text-blue-300' : 'text-brand-accent hover:text-brand-accent-hover')}
        >
            {linkLabel}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
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
        {/* 경로 위를 도는 점. framer의 rAF 무한 루프(cx 애니메이션)는 화면 밖에서도
            메인스레드에 얹히고 reduced-motion에도 잡히지 않아, hero-blob과 같은
            결정으로 CSS 키프레임(.path-dot, index.css)에 이식했다 — 시각 결과 동일. */}
        <circle className="path-dot" cx="50" cy="50" r="6" fill="#2563eb" />
    </svg>
);

const ProcessNode = ({ title, idx }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: idx * 0.3 + 0.5 }}
        className="relative z-10 flex flex-col items-center bg-white px-4 md:px-6 py-4 rounded-full border-2 border-brand-100 shadow-md min-w-0 md:min-w-[200px] w-full md:w-auto"
    >
        <div className="text-slate-800 font-bold whitespace-nowrap text-base">{title}</div>
    </motion.div>
);

/* 운영 원칙 항목 — 구 DnaCard. 카드 껍데기와 아이콘(우상단 워터마크 + 좌측
   아이콘 박스)을 걷어낸 텍스트 전용 조각이다(오너 결정). 아이콘을 되돌리지 말 것. */
const PrincipleItem = ({ no, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: DUR.reveal, delay, ease: EASE_OUT }}
        className="border-t-2 border-slate-200 pt-6"
    >
        <span className="text-label font-extrabold tracking-widest text-brand-accent">{no}</span>
        <h3 className="text-subhead font-extrabold text-slate-900 mt-3 mb-3 tracking-tight">{title}</h3>
        <p className="text-copy text-slate-600 break-keep">{desc}</p>
    </motion.div>
);

const Activities = () => {
    const [activeTab, setActiveTab] = useState(0);

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

            {/* 1. Hero — 활동 선언 + 세 축 목차 */}
            <section className="container mx-auto px-6 mb-24 md:mb-32 relative">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="max-w-4xl text-left"
                >
                    <motion.h1
                        variants={fadeInUp}
                        className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3] mb-6 break-keep"
                    >
                        KBLs는 <span className="text-brand-accent">공모전 · 자체 프로젝트 · 스터디</span><br className="hidden md:block" /> 세 축으로 활동합니다
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        className="text-sm md:text-base text-slate-600 leading-relaxed font-medium break-keep max-w-3xl"
                    >
                        배우는 데서 멈추지 않습니다. 한 학기의 활동은 이 세 축으로 채워지고, <br className="hidden md:block" />각 활동은 손에 잡히는 산출물로 끝납니다.
                    </motion.p>
                </motion.div>

                {/* 세 축 스트립 = 페이지 목차. 앵커 점프는 각 축 섹션의 scroll-mt-28이
                    받는다 — 고정 헤더(GNB) 아래로 제목이 숨지 않게 하는 값이다. */}
                <motion.nav
                    aria-label="활동 바로가기"
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT_ONCE}
                    variants={staggerContainer}
                    className="mt-12 grid gap-4 md:grid-cols-3"
                >
                    {AXES.map((axis) => (
                        <motion.a
                            key={axis.id}
                            href={'#' + axis.id}
                            variants={fadeInUp}
                            className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-200 hover:bg-brand-50/50 transition-colors press focus-ring"
                        >
                            <span className="text-label font-extrabold tracking-widest text-brand-accent">{axis.no}</span>
                            <span className="mt-3 flex items-center text-subhead font-extrabold text-slate-900">
                                {axis.name}
                                {/* 옆에 축 이름이 함께 있으므로 이 셰브론은 장식 — slate-400 허용 */}
                                <ChevronRight className="ml-auto w-5 h-5 text-slate-400 group-hover:text-brand-accent group-hover:translate-x-1 transition" />
                            </span>
                            <p className="mt-2 text-copy text-slate-600 break-keep">{axis.line}</p>
                        </motion.a>
                    ))}
                </motion.nav>
            </section>

            {/* 2. 축 01 — 공모전 */}
            <section id="activity-contest" className="container mx-auto px-6 scroll-mt-28 mb-32 md:mb-48">
                <AxisHeader
                    no="01"
                    name="공모전"
                    title={<>한계를 넘는 실전 경험,<br />체계적인 공모전 완주</>}
                    lead="실제 기업·기관이 내놓은 과제에 팀으로 참가해, 제출과 발표까지 끝내는 활동입니다."
                />
                <AxisProcessIntro text="KBLs의 공모전은 팀 빌딩부터 다릅니다. 전체 현황을 점검하는 랩실 임원과 실무를 이끄는 팀장의 이중 관리 시스템을 통해 중도 포기 리스크를 차단합니다." />

                <div className="relative w-full flex items-center bg-slate-50 rounded-3xl p-8 md:h-[260px] overflow-hidden">
                    {/* SVG Path connecting the nodes */}
                    <AnimatedPath />

                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 py-4 md:py-0">
                        <ProcessNode title="조직적 팀 빌딩" idx={0} />
                        <div className="md:hidden w-1 h-8 bg-brand-200" />
                        <ProcessNode title="투명한 과정 공유" idx={1} />
                        <div className="md:hidden w-1 h-8 bg-brand-200" />
                        <ProcessNode title="최종 완주 & 회고" idx={2} />
                    </div>
                </div>

                <AxisOutcome
                    items={["기획서·발표자료", "제출·발표 경험", "팀 회고 기록"]}
                    linkLabel="공모전 산출물 보기"
                />
            </section>

            {/* 3. 축 02 — 자체 프로젝트 (홈 What We Do와 같은 이름) */}
            <section id="activity-project" className="scroll-mt-28 bg-slate-900 py-12 md:py-24 rounded-[3rem] mx-4 md:mx-8 mb-32 md:mb-48 text-white relative overflow-hidden">
                {/* Decorative ambient background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-brand-600/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <AxisHeader
                        tone="dark"
                        no="02"
                        name="자체 프로젝트"
                        title={<>우리가 찾은 문제를,<br />우리 손으로 만듭니다</>}
                        lead="누군가 던져준 과제가 아니라 우리가 직접 발굴한 문제를, 최소 기능 제품(MVP)으로 구현하는 활동입니다."
                    />
                    <AxisProcessIntro
                        tone="dark"
                        text="실제 데이터를 분석해 근거를 찾는 데서 시작합니다. 네 단계를 거치며 각 단계의 결과물이 다음 단계의 입력이 됩니다."
                    />

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
                                    <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed px-4">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <AxisOutcome
                        tone="dark"
                        items={["문제 정의서", "Figma 프로토타입", "동작하는 MVP"]}
                        linkLabel="프로젝트 산출물 보기"
                    />
                </div>
            </section>

            {/* 4. 축 03 — 스터디 */}
            <section id="activity-study" className="container mx-auto px-6 scroll-mt-28 mb-32 md:mb-48">
                <AxisHeader
                    no="03"
                    name="스터디"
                    title={<>성장의 뼈대를 세우는<br />체계적인 지식 공유</>}
                    lead="다음 활동에 필요한 역량을 부원이 직접 열고 함께 채우는 활동입니다. 단발성 겉핥기식 스터디는 지양합니다."
                />
                <AxisProcessIntro text="매 학기 부원 수요조사로 개설되고, 스터디 리더의 주도하에 '결과물 도출'을 목표로 밀도 있게 진행됩니다." />

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

                <AxisOutcome
                    className="max-w-5xl mx-auto"
                    items={["정리 노트·학습 기록", "공유 세션 발표자료", "실습 산출물"]}
                    linkLabel="스터디가 이어진 결과 보기"
                />
            </section>

            {/* 5. 운영 원칙 — 구 'Our Culture DNA'. 세 축 아래로 내려온 근거 밴드다. */}
            <section className="bg-slate-50 rounded-[3rem] mx-4 md:mx-8 py-12 md:py-20 mb-12 md:mb-24">
                <div className="container mx-auto px-6 lg:px-12">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT_ONCE}
                        variants={fadeInUp}
                        className="max-w-3xl mb-12 md:mb-16"
                    >
                        <h2 className="text-heading font-extrabold text-slate-900 mb-4">이 활동들을 지탱하는 운영 원칙</h2>
                        <p className="text-copy text-slate-600 break-keep">세 활동이 매 학기 같은 밀도로 굴러가는 이유입니다.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 md:gap-10">
                        <PrincipleItem
                            no="01"
                            delay={0}
                            title="투명한 공유"
                            desc="모든 회의록, 진행 상황, 트러블슈팅은 노션(Notion)에 투명하게 기록되고 공유됩니다."
                        />
                        <PrincipleItem
                            no="02"
                            delay={0.08}
                            title="시스템 기반 협업"
                            desc="개인의 의지에만 의존하지 않습니다. 임원-팀장-팀원으로 이어지는 명확한 역할 분담이 무임승차를 방지합니다."
                        />
                        <PrincipleItem
                            no="03"
                            delay={0.16}
                            title="결과물 증명"
                            desc="배움에서 멈추지 않고 기획서, MVP 등 눈에 보이는 실질적인 산출물을 반드시 도출합니다."
                        />
                    </div>
                </div>
            </section>

            {/* 6. Bottom CTA */}
            <section className="py-12 md:py-24 bg-gradient-to-b from-white to-brand-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-2xl mx-auto"
                    >
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
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default Activities;
