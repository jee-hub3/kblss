import React, { useState } from 'react';
import Seo from '../components/Seo';
import Button from '../components/Button';
import { ROUTE_META } from '../lib/routeMeta';
import { trackEvent } from '../lib/analytics';
import { ORG_INFO } from '../lib/orgInfo';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { fadeInUp, staggerContainer, ACCORDION_TRANSITION } from '../lib/motion';

const faqs = [
    {
        question: "Q. KBLs는 어떤 곳인가요?",
        answer: "KBLs는 다양한 전공과 배경을 가진 사람들이 협력하며 프로젝트를 진행하는 랩실입니다. 단순한 이론 학습이 아니라, 실제 문제를 해결하고 결과물을 만들어내는 실천적인 경험을 제공합니다."
    },
    {
        // 질문에서 '(전공/학년)'을 뺐다 — 축을 좁혀 물으니 답도 그 축만 답했고,
        // 그래서 신분 제한을 말하는 /apply 표기와 모순처럼 보였다(2026-08 사고).
        // 지원자가 실제로 궁금한 것은 "내가 지원할 수 있나"이지 특정 축이 아니다.
        question: "Q. 지원 자격에 제한이 있나요?",
        // 자격은 ORG_INFO.eligibility 단일 소스 — /apply 제목과 같은 값을 읽는다.
        // "누구나 지원 가능합니다"는 쓰지 않는다. 그 한 문장이 신분 제한을 지운다.
        answer: `${ORG_INFO.eligibility.full} 배우고자 하는 의지와 프로젝트에 열정적으로 참여할 마음이 있다면 환영합니다.`
    },
    {
        question: "Q. 정기 회의 및 주요 활동 시간은 언제인가요?",
        answer: `랩실 정기 회의는 주로 ${ORG_INFO.meeting.day} ${ORG_INFO.meeting.time}에 진행됩니다. 그 외 스터디나 공모전 팀 회의는 각 팀원들의 일정에 맞춰 자율적으로 진행됩니다.`
    },
    {
        question: "Q. 활동하면서 반드시 지켜야 할 의무가 있나요?",
        answer: "네, 모든 구성원은 학기당 최소 1개의 '공모전'과 1개의 '스터디' 참여를 의무로 합니다. 참여만을 위한 형식적 활동은 지양하며, 완주 및 산출물 제출을 기본 요건으로 하고 있습니다."
    },
    {
        question: "Q. 스터디는 어떤 방식으로 진행되나요?",
        // 주제 "목록"은 여기 두지 않는다 — Activities의 4개 주제 영역과 같은
        // 사실이 두 곳에 있으면 동기화는 반드시 실패한다(실제로 어긋났었다).
        // 운영 방식(주기·횟수)만 여기서 답하고, 영역은 Activities로 보낸다.
        answer: `스터디는 1~2주에 1회 진행을 원칙으로 하며 학기당 약 8회 진행됩니다. 주제는 고정 커리큘럼이 아니라 매 학기 부원 수요조사를 통해 개설됩니다. 어떤 주제 영역을 다루는지는 Activities 페이지에서 확인해 보세요.`
    },
    {
        question: "Q. 학년별로 권장하는 활동 가이드라인이 있나요?",
        answer: "네, 1학년은 랩실 적응과 공모전 완주 경험을, 2학년은 공모전 실전 경험과 학업 향상을 권장합니다. 3학년은 진로 관련 공모전과 자격증 취득, 4학년은 취업 대비 실질적 포트폴리오 확보를 추천하고 있습니다."
    },
    {
        question: "Q. 활동 참여도가 저조하면 불이익이 있나요?",
        // 경고 사유는 ORG_INFO.warning이 단일 소스 — /apply 경고 규정과 같은 문장이어야 한다.
        // 여기 없는 조건(기여도 기준, 경고 누적 시 조치 등)은 실제 규정이 아니므로 쓰지 않는다.
        answer: `${ORG_INFO.warning.reasons.join(', ')}에는 ${ORG_INFO.warning.method}합니다.`
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 md:pt-32 md:pb-32">
            <Seo {...ROUTE_META['/faq']} />
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Hero Section */}
                <section className="mb-20 text-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl mx-auto flex flex-col items-center">
                        <motion.div variants={fadeInUp} className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                            <MessageCircleQuestion className="w-8 h-8 text-brand-accent" />
                        </motion.div>
                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 mt-4">
                            자주 묻는 질문
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed font-medium">
                            KBLs 지원 전 궁금하신 점들을 확인해 보세요. <br className="hidden md:block" />
                            {/* "오른쪽 아래" 같은 위치 설명은 모바일 레이아웃에서 어긋난다.
                                위치를 설명하는 대신 그 자리에서 바로 보낼 수 있게 mailto를 둔다. */}
                            해결되지 않은 궁금증은{' '}
                            <a href={`mailto:${ORG_INFO.email}`} className="text-brand-accent font-semibold hover:underline break-all">{ORG_INFO.email}</a>
                            으로 문의 바랍니다.
                        </motion.p>
                    </motion.div>
                </section>

                {/* FAQ Accordion — 스크롤 리빌은 걷어냈다(증거 연출 원칙, motion.js 참조).
                    카드는 정보이지 증거가 아니다. 아코디언 열림/닫힘 전환만 남는다. */}
                <section>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-brand-accent shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        aria-expanded={isOpen}
                                        className="w-full text-left px-8 py-6 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-inset"
                                    >
                                        <h2 className={`text-lg md:text-xl font-bold transition-colors ${isOpen ? 'text-brand-accent' : 'text-slate-900'}`}>
                                            {faq.question}
                                        </h2>
                                        {/* 셰브론 회전은 사이트 공통으로 CSS transition-transform
                                            duration-200 — Recruit 아코디언과 같은 구현·속도 */}
                                        <div
                                            className={`flex-shrink-0 ml-4 p-1 rounded-full transition-all duration-200 ${isOpen ? 'bg-brand-50 text-brand-accent rotate-180' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={ACCORDION_TRANSITION}
                                            >
                                                <div className="px-8 pb-8 pt-2">
                                                    <div className="w-full h-[1px] bg-slate-100 mb-6"></div>
                                                    <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium break-keep">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 하단 CTA — FAQ를 끝까지 읽은 사람이 지원 의사가 가장 높다 */}
                <section className="mt-12 md:mt-24 text-center">
                    <p className="text-copy text-slate-600 font-medium mb-6">궁금증이 풀리셨다면, 다음 기수에서 만나요.</p>
                    <Button to="/apply" size="lg" onClick={() => trackEvent('apply_cta_click', { location: 'faq_bottom' })}>
                        지원하기
                    </Button>
                </section>
            </div>
        </div>
    );
};

export default FAQ;