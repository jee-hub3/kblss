import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import FitVisionTab from '../components/FitVisionTab';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
import { ORG_INFO, getLeadsByTier } from '../lib/orgInfo';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
// 조직도 선 그리기(pathLength)의 duration·delay는 연출이라 로컬 값을 유지한다.
import { fadeInUp, staggerContainer, scaleIn, tabPanel } from '../lib/motion';

/**
 * 역할별 한 줄 설명. 이름·직함은 orgInfo.js가 소유하고, 설명문은 이 페이지의
 * 표현이라 여기 둔다(사실과 표현의 분리).
 *
 * ★ 배열 순서가 아니라 role을 키로 찾는다. 예전에는 leads를 순서대로 구조분해해
 * 설명을 붙였는데, 그러면 순서를 바꾸는 순간 엉뚱한 사람에게 엉뚱한 설명이 붙고
 * 인원이 늘면 뒤쪽 사람이 조용히 사라진다.
 *
 * 여기 없는 역할은 카드가 설명 없이 렌더된다 — 실제 업무 분담을 모르는 채로
 * 문구를 지어내면 지원자에게 사실이 아닌 정보를 고지하게 된다. 새 역할이
 * 생기면 오너에게 문구를 받아 여기 추가할 것.
 */
const ROLE_DESC = {
    '랩실장': '운영 총괄 및 방향 설정, 회계 투명성 유지',
    '부랩실장': '구성원 관리, 워크스페이스/홈페이지 설계 및 운영',
    '일정·기획 임원': '일정 관리, 네트워킹/활동 기획',
    '프로젝트 임원': '프로젝트 기획, 프로젝트 운영 및 작업 관리',
    '공모전 임원': '팀 매칭, 일정 파악 및 공모전 완주율 관리',
    '스터디 임원': '주제 기획, 리더 배정 및 산출물 완성도 관리',
};

const withDesc = (lead) => ({ ...lead, desc: ROLE_DESC[lead.role] });

const GlassCard = ({ role, name, desc }) => (
    <motion.div
        variants={scaleIn}
        className="relative group h-full rounded-3xl p-8 transition-all duration-300 bg-white/60 backdrop-blur-md border border-white/50 shadow-sm hover:border-brand-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 flex flex-col items-center text-center"
    >
        {/* Subtle glow on hover for all cards */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-accent/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center flex-1 w-full">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 bg-brand-50 text-brand-accent group-hover:bg-brand-100 shrink-0">
                <User className="w-6 h-6" />
            </div>
            <div className="text-label font-bold tracking-[0.15em] uppercase mb-2 text-slate-500 group-hover:text-brand-accent transition-colors">
                {role}
            </div>
            <h2 className="text-subhead font-extrabold mb-3 tracking-tight text-slate-900">
                {name}
            </h2>
            {/* 설명문이 없는 역할은 문단 자체를 렌더하지 않는다 —
                빈 <p>가 남으면 mt-auto 때문에 카드 안에 정체 모를 여백만 생긴다. */}
            {desc && (
                <p className="text-sm leading-relaxed font-medium break-keep max-w-xs text-slate-500 mt-auto">
                    {desc}
                </p>
            )}
        </div>
    </motion.div>
);

const Organization = () => {
    // 이름·직함은 orgInfo.js 단일 소스에서 온다(지원 페이지 문의처와 공유).
    // tier로 층을 나누므로 명단의 순서·인원이 바뀌어도 이 코드는 그대로다.
    const professor = { role: ORG_INFO.professor.role, name: `${ORG_INFO.professor.name} 교수`, desc: '"데이터와 기획력을 바탕으로 세상을 변화시킬 실무형 인재들의 요람"' };
    // 운영 총괄(랩실장·부랩실장)은 기능별 임원과 층이 다르므로 지도교수 바로 아래 나란히 선다.
    const leadership = getLeadsByTier('lead').map(withDesc);
    const officers = getLeadsByTier('officer').map(withDesc);

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
        // overflow-hidden은 sticky 탭 스트립을 무력화한다(스크롤 기준이 뷰포트가
        // 아니게 됨). 가로 삐짐 방지 목적은 overflow-x-clip이 대신한다 —
        // clip은 스크롤 컨테이너를 만들지 않아 sticky가 유지된다.
        <div className="w-full bg-slate-50/50 pt-24 md:pt-32 pb-0 overflow-x-clip">
            <Seo {...ROUTE_META['/organization']} />
            {/* Tabs Controller — sticky.
                /apply 탭바와 같은 top-[80px] 기준(헤더 높이 기준은 하나여야 한다).
                z-30: GNB.jsx의 층 규약(페이지 sticky ≤ z-30).
                탭이 화면에 남아 인재상 탭 안쪽에서도 현재 위치가 보이고
                '구성'으로 되돌아갈 수 있다 — 별도 뒤로가기 화살표는 제거했다. */}
            <div className="sticky top-[80px] z-30 bg-slate-50/90 backdrop-blur-sm flex justify-center mb-10 pt-4">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('구성')}
                        className={`min-h-11 px-3 pb-4 font-bold text-lg md:text-xl transition-colors press focus-ring relative ${activeTab === '구성' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
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
                        className={`min-h-11 px-3 pb-4 font-bold text-lg md:text-xl transition-colors press focus-ring relative ${activeTab === '인재상' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
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
                        {...tabPanel(-1)}
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

                                    {/* Level 2: 운영 총괄 (랩실장 · 부랩실장).
                                        6인 개편에서 부랩실장을 이 층으로 올렸다 — 기능별 임원이
                                        아니라 랩실장과 함께 운영을 총괄하는 자리이고, /apply
                                        문의처가 이미 두 사람을 한 쌍으로 노출하고 있었다.
                                        덕분에 아래 기능 임원은 정확히 4명이 되어 4열 그리드가
                                        그대로 맞는다(5명이면 4+1로 고아 카드가 생겼다). */}
                                    <div className="relative mt-16 md:mt-24">
                                        {/* Desktop: 지도교수 -> 두 갈래. 폭·끝점은 아래 pair
                                            그리드(max-w-2xl=672px, gap-6)의 카드 중심과 맞춘다:
                                            카드 폭 (672-24)/2=324 → 중심 162 / 510 */}
                                        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 pointer-events-none z-0" style={{ width: '672px', top: '-104px', height: '112px' }}>
                                            <svg className="w-full h-full text-brand-200" viewBox="0 0 672 112" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                {/* 중앙 줄기 */}
                                                <motion.path
                                                    d="M 336 0 C 344 14, 328 26, 336 44"
                                                    stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                                />
                                                {/* 좌 갈래 (랩실장) */}
                                                <motion.path
                                                    d="M 336 44 C 300 72, 196 78, 162 112"
                                                    stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                                                />
                                                {/* 우 갈래 (부랩실장) */}
                                                <motion.path
                                                    d="M 336 44 C 372 72, 476 78, 510 112"
                                                    stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                                                />
                                            </svg>
                                        </div>

                                        <motion.div
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, margin: "-50px" }}
                                            variants={staggerContainer}
                                            className="relative z-10 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            {/* 두 카드 바닥에서 모여 아래 기능 임원으로 내려가는 줄기.
                                                페어를 하나의 층으로 묶어 보여주기 위해 Level 3의 중앙
                                                줄기를 이리로 옮겼다 — 그대로 두면 선이 두 카드 사이
                                                빈 공간에서 솟아난 것처럼 보인다. 끝점(336,45)은 아래
                                                갈래 4개의 시작점과 같은 자리다. */}
                                            <div className="hidden lg:block absolute left-1/2 top-full -translate-x-1/2 pointer-events-none z-0" style={{ width: '672px', height: '45px' }}>
                                                <svg className="w-full h-full text-brand-200" viewBox="0 0 672 45" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                    <motion.path
                                                        d="M 162 0 C 162 18, 290 22, 336 45"
                                                        stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeInOut" }}
                                                    />
                                                    <motion.path
                                                        d="M 510 0 C 510 18, 382 22, 336 45"
                                                        stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeInOut" }}
                                                    />
                                                </svg>
                                            </div>

                                            {leadership.map((lead) => (
                                                <div key={lead.role} className="relative flex flex-col w-full h-full">
                                                    {/* lg 미만에서는 데스크톱 갈래가 숨으므로 카드마다
                                                        짧은 연결선을 둔다(기능 임원 카드와 같은 방식) */}
                                                    <div className="lg:hidden absolute -top-16 left-1/2 -translate-x-1/2 w-8 h-16 pointer-events-none z-0">
                                                        <svg className="w-full h-full text-brand-200" preserveAspectRatio="none">
                                                            <motion.path
                                                                d="M 16 0 C 8 30, 24 70, 16 100"
                                                                stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                                initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }}
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="w-full h-full z-10 flex flex-col">
                                                        <GlassCard {...lead} />
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>

                                    {/* Level 3: 기능별 임원 4명 (일정·기획 / 프로젝트 / 공모전 / 스터디).
                                        아래 SVG 갈래 4개의 끝점(x=125·375·625·875)이 4열 그리드의
                                        칼럼 중심과 맞물려 있다 — 인원이 4에서 벗어나면 그리드와
                                        선을 함께 손봐야 한다. */}
                                    <div className="relative mt-16 md:mt-32">
                                        {/* Desktop SVG Connecting Lines (운영 총괄 -> 기능 임원) */}
                                        <div className="hidden lg:block absolute inset-0 pointer-events-none z-0" style={{ top: '-128px', height: '128px' }}>
                                            <svg
                                                className="w-full h-full text-brand-200"
                                                viewBox="0 0 1000 200"
                                                preserveAspectRatio="none"
                                            >
                                                {/* 중앙 줄기는 Level 2 하단(페어 카드 바닥에서 모이는 선)으로
                                                    옮겼다 — 여기서는 그 끝점(y=70)에서 갈래만 뻗는다. */}
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
                                            {officers.map((exec, idx) => (
                                                <div key={exec.role} className="flex flex-col justify-start w-full relative h-full">
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
                                    {/* hover 색은 Button.jsx와 같은 브랜드 토큰으로 통일 */}
                                    <Link
                                        to="/activities"
                                        className="inline-flex items-center bg-brand-accent text-white hover:bg-brand-accent-hover px-8 py-4 rounded-full text-base font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 press focus-ring"
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
                        {...tabPanel(1)}
                        className="w-full"
                    >
                        <FitVisionTab />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Organization;
