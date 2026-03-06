import React, { useState } from 'react';
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
        question: "Q. 지원 자격은 어떻게 되나요?",
        answer: "KBLs는 데이터와 비즈니스 기획에 열정이 있는 성균관대학교 학부생이라면 누구나 지원 가능합니다. 전공 무관이며, 휴학생도 우대합니다. 매 학기 초 모집 공고를 통해 상세 요건을 안내해 드립니다."
    },
    {
        question: "Q. 매주 정기 회의는 언제 진행되나요?",
        answer: "정규 세션은 매주 목요일 오후 6시 30분에 대면으로 진행됩니다. 시험 기간에는 2주 휴회를 가지며, 그 외 스터디나 프로젝트 회의는 각 팀의 일정에 맞춰 자율적으로 진행됩니다."
    },
    {
        question: "Q. 코딩이나 데이터 분석 경험이 없어도 괜찮은가요?",
        answer: "네, 괜찮습니다! KBLs는 실력보다 '성장하고자 하는 의지'와 '결과를 만들어내는 실행력'을 더 중요하게 생각합니다. 방학 및 학기 중 진행되는 내부 스터디를 통해 기초부터 차근차근 배울 수 있는 환경을 제공합니다."
    },
    {
        question: "Q. 활동 기간은 몇 학기인가요?",
        answer: "기본적인 필수 활동 기간은 연속 2학기입니다. 첫 학기에는 스터디와 내부 프로젝트로 기본기를 다지고, 두 번째 학기부터는 외부 해커톤 및 공모전에 주도적으로 참여하게 됩니다."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-32 pb-32">
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
                            해결되지 않은 궁금증은 오른쪽 아래 공식 이메일로 문의 바랍니다.
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
