import React, { useState } from 'react';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const faqs = [
    {
        question: "Q. KBLs는 어떤 곳인가요?",
        answer: "KBLs는 다양한 전공과 배경을 가진 사람들이 협력하며 프로젝트를 진행하는 랩실입니다. 단순한 이론 학습이 아니라, 실제 문제를 해결하고 결과물을 만들어내는 실천적인 경험을 제공합니다."
    },
    {
        question: "Q. 지원 자격에 제한이 있나요? (전공/학년)",
        answer: "특정 전공이나 학년에 대한 제한은 전혀 없습니다. 배우고자 하는 의지와 열정적으로 프로젝트에 참여할 수 있는 분이라면 누구나 지원 가능합니다."
    },
    {
        question: "Q. 정기 회의 및 주요 활동 시간은 언제인가요?",
        answer: "랩실 정기 회의는 주로 화요일 오후 6시 이후에 진행됩니다. 그 외 스터디나 공모전 팀 회의는 각 팀원들의 일정에 맞춰 자율적으로 진행됩니다."
    },
    {
        question: "Q. 활동하면서 반드시 지켜야 할 의무가 있나요?",
        answer: "네, 모든 구성원은 학기당 최소 1개의 '공모전'과 1개의 '스터디' 참여를 의무로 합니다. 참여만을 위한 형식적 활동은 지양하며, 완주 및 산출물 제출을 기본 요건으로 하고 있습니다."
    },
    {
        question: "Q. 스터디는 어떤 방식으로 진행되나요?",
        answer: "스터디는 1~2주에 1회 진행을 원칙으로 하며 학기당 약 8회 진행됩니다. 전공 심화 학업, 자격증(빅데이터, 컴활 등), 툴(Python, Notion, Figma 등), 취업 준비 등 다양한 주제로 운영됩니다."
    },
    {
        question: "Q. 학년별로 권장하는 활동 가이드라인이 있나요?",
        answer: "네, 1학년은 랩실 적응과 공모전 완주 경험을, 2학년은 공모전 실전 경험과 학업 향상을 권장합니다. 3학년은 진로 관련 공모전과 자격증 취득, 4학년은 취업 대비 실질적 포트폴리오 확보를 추천하고 있습니다."
    },
    {
        question: "Q. 활동 참여도가 저조하면 불이익이 있나요?",
        answer: "공모전 및 스터디에 무단 결석이 2회 이상 발생하거나 최종 결과물 기여도가 5% 미만일 경우 사전 면담을 거쳐 경고가 1회 부여됩니다. 경고 2회 누적 시 랩실장과 활동 지속 여부를 논의하게 됩니다."
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
                            <a href="mailto:keybridgeleaders@gmail.com" className="text-brand-accent font-semibold hover:underline break-all">keybridgeleaders@gmail.com</a>
                            으로 문의 바랍니다.
                        </motion.p>
                    </motion.div>
                </section>

                {/* FAQ Accordion */}
                <section>
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-brand-accent shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full text-left px-8 py-6 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-inset"
                                    >
                                        <h3 className={`text-lg md:text-xl font-bold transition-colors ${isOpen ? 'text-brand-accent' : 'text-slate-900'}`}>
                                            {faq.question}
                                        </h3>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className={`flex-shrink-0 ml-4 p-1 rounded-full ${isOpen ? 'bg-brand-50 text-brand-accent' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <ChevronDown className="w-5 h-5" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
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
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>
            </div>
        </div>
    );
};

export default FAQ;