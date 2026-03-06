import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Apply = () => {
    const [activeTab, setActiveTab] = useState("info"); // "info" or "form"
    const [openAccordion, setOpenAccordion] = useState(null);

    const toggleAccordion = (idx) => {
        setOpenAccordion(openAccordion === idx ? null : idx);
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-32 pb-32 flex flex-col items-center">
            <div className="w-full max-w-3xl px-6">

                {/* 1. Header (공통 상단 - Left Aligned) */}
                <header className="mb-12 text-left">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4 break-keep">
                        26학년도 상반기 KBLs 신입 회원 모집<br />
                        <span className="text-xl md:text-3xl text-slate-400 font-bold block mt-3">(학사 신입/재학생)</span>
                    </h1>
                    <p className="text-lg text-slate-600 font-medium mt-6 break-keep">
                        "스스로 문제를 정의하고 해결하고 싶다면, KBLs와 함께하세요."
                    </p>
                </header>

                {/* 2. Tab Navigation (탭 메뉴 - Sticky, Left Aligned) */}
                <div className="sticky top-[80px] bg-slate-50 z-40 flex border-b border-slate-200 mb-10 pt-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`pb-4 font-bold text-xl transition-colors relative ${activeTab === "info" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            영입정보
                            {activeTab === "info" && (
                                <motion.div
                                    layoutId="applyTabIndicator"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("form")}
                            className={`pb-4 font-bold text-xl transition-colors relative ${activeTab === "form" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            지원서 작성
                            {activeTab === "form" && (
                                <motion.div
                                    layoutId="applyTabIndicator"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Tab Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait" custom={activeTab}>
                        {activeTab === "info" ? (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full space-y-14 pb-12"
                            >
                                {/* 모집 대상 */}
                                <section>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-5 tracking-tight">모집 대상</h3>
                                    <ul className="list-disc pl-6 space-y-3 text-slate-700 font-medium text-lg leading-relaxed">
                                        <li>데이터 분석 실전 적용 희망자</li>
                                        <li>공모전 완주 목표자</li>
                                        <li>책임감 있게 팀 활동이 가능한 분</li>
                                    </ul>
                                </section>

                                {/* 핵심 혜택 */}
                                <section>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">KBLs만의 핵심 혜택</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { emoji: "✨", text: "유료 생성형 AI 서비스 지원" },
                                            { emoji: "🏢", text: "인문경영관 212호 전용 학습 공간 제공" },
                                            { emoji: "☕", text: "비품 및 간식 무제한" },
                                            { emoji: "🎓", text: "필수 자격증 취득 비용 전폭 지원" }
                                        ].map((benefit, i) => (
                                            <div key={i} className="flex items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="text-2xl mr-4 flex-shrink-0">
                                                    {benefit.emoji}
                                                </div>
                                                <span className="font-bold text-slate-800 text-base leading-snug">{benefit.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* 상세 모집 일정 (타임라인) */}
                                <section>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">상세 모집 일정</h3>
                                    <div className="relative pl-7 border-l-2 border-slate-200 space-y-10 ml-2">
                                        {[
                                            { date: "3/02~3/17", title: "서류 접수" },
                                            { date: "3/18", title: "서류 발표" },
                                            { date: "3/18~3/24", title: "면접" },
                                            { date: "3/25", title: "최종 발표" }
                                        ].map((step, i) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[35px] top-1.5 w-4 h-4 bg-slate-400 rounded-full ring-4 ring-slate-50 relative z-10" />
                                                <div className="text-base font-bold text-brand-600 mb-1 tracking-wide">{step.date}</div>
                                                <div className="font-extrabold text-xl text-slate-900">{step.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Rules & Duties (아코디언) */}
                                <section>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-5 tracking-tight">Rules & Duties</h3>
                                    <div className="space-y-4">
                                        {[
                                            { title: "활동 의무", content: "학기당 공모전/스터디 1회 필수, 화요일 정기 모임" },
                                            {
                                                title: "경고 규정", content: (
                                                    <div className="space-y-4">
                                                        <p className="font-bold text-slate-800">다음의 경우 사전 면담을 거쳐 경고 1회를 부여</p>
                                                        <ul className="list-inside list-disc pl-2 space-y-2 text-slate-600">
                                                            <li>공모전 또는 스터디에 반복적으로 참여하지 않는 경우</li>
                                                            <li>사전 협의 없는 중도 이탈/이유 없는 무단 결석이 2회 이상 발생</li>
                                                        </ul>
                                                        <p className="pt-2 text-sm text-slate-500">상세 내용이 궁금하시면 문의 부탁드립니다.</p>
                                                    </div>
                                                )
                                            }
                                        ].map((rule, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all">
                                                <button
                                                    onClick={() => toggleAccordion(i)}
                                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 text-lg hover:bg-slate-50"
                                                >
                                                    {rule.title}
                                                    <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${openAccordion === i ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openAccordion === i && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-6 pt-0 text-slate-600 font-medium text-lg leading-relaxed bg-white border-t border-slate-50">
                                                                {rule.content}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* 하단 버튼 - Text Left to match Daangn layout style */}
                                <div className="pt-10 pb-20">
                                    <button
                                        onClick={() => {
                                            setActiveTab("form");
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xl shadow-md transition-all flex items-center justify-center"
                                    >
                                        지원서 작성하기
                                    </button>
                                </div>
                            </motion.div>

                        ) : (

                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full flex flex-col pb-20"
                            >
                                <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm mb-8 overflow-hidden relative" style={{ height: '800px' }}>
                                    {/* 실제 Iframe 태그로 구현 (유저 요청: "더미 Iframe 태그를 꽉 차게 렌더링") */}
                                    <iframe
                                        src="about:blank"
                                        className="w-full h-full border-none bg-slate-100"
                                        title="KBLs 지원서 작성 폼"
                                    />
                                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
                                        <svg className="w-16 h-16 mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-extrabold text-2xl text-slate-500">Notion 지원서 Form Iframe 영역</span>
                                        <span className="font-medium text-slate-400 mt-2">이곳에 노션 폼이 임베드됩니다.</span>
                                    </div>
                                </div>

                                {/* Contact Area */}
                                <div className="text-sm text-slate-600 font-medium space-y-3 leading-relaxed bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                                    <h4 className="font-bold text-slate-900 text-lg mb-4">Contact (폼 하단 텍스트)</h4>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-400 font-bold mb-1 sm:mb-0">[지도교수]</span>
                                        <span className="text-slate-800">이상곤 교수님</span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-400 font-bold mb-1 sm:mb-0">[임원진]</span>
                                        <span className="text-slate-800">김예진 (회장) / 지근학 (부회장)</span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center">
                                        <span className="w-24 text-slate-400 font-bold mb-1 sm:mb-0">[방문 문의]</span>
                                        <span className="text-slate-800">인문경영관 212호 KBLs 연구실</span>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default Apply;
