import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, User, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const categories = ["전체보기", "🏆 Project Review", "📚 Study Note", "☕ Life", "📢 News"];

const featuredPost = {
    category: "🏆 Project Review",
    title: "[대상 수상] OO 데이터 분석 해커톤 회고 및 모델링 의사결정 과정",
    summary: "치열했던 무박 2일의 기록. 우리 팀이 데이터 전처리부터 최종 모델링까지 어떤 기준으로 의사결정을 내렸고, 위기를 어떻게 극복했는지 그 생생한 과정을 공유합니다.",
    author: "김철수",
    date: "2026.03.01",
    imageGrad: "from-slate-800 to-slate-600",
    link: "#"
};

const newsLog = [
    { id: 1, category: "📚 Study Note", title: "[SQLD 스터디] 1주차 핵심 개념 정리 및 기출 풀이", summary: "이번 학기 신설된 SQLD 자격증 스터디의 첫 주차 요약본입니다. SELECT 문과 JOIN의 기본 개념을 짚어보았습니다.", author: "박지민", date: "2026.03.04", imageGrad: "from-blue-200 to-indigo-300", link: "#" },
    { id: 2, category: "☕ Life", title: "25학년도 하반기 KBLs 종강 총회 스케치", summary: "한 학기 동안 수고한 모든 랩실 부원들과 함께한 종강 총회! 우수 활동자 시상식부터 즐거웠던 회식 자리까지.", author: "이영희", date: "2025.12.20", imageGrad: "from-amber-200 to-orange-300", link: "#" },
    { id: 3, category: "📢 News", title: "26학년도 상반기 신규 부원 리크루팅 시작", summary: "데이터에 진심인 분들을 찾습니다. 이번 상반기 KBLs가 제공하는 역대급 혜택과 모집 일정을 확인하세요.", author: "김회장", date: "2026.02.15", imageGrad: "from-emerald-200 to-teal-300", link: "#" },
    { id: 4, category: "🏆 Project Review", title: "[우수상] 서울시 창업 해커톤: 시니어 여가 매칭 서비스 MVP", summary: "시니어 분들을 위한 서비스를 기획하며 겪었던 시행착오와 사용자 테스트(UT) 과정에서의 인사이트 정리.", author: "최유진", date: "2025.11.10", imageGrad: "from-rose-200 to-pink-300", link: "#" },
    { id: 5, category: "📚 Study Note", title: "[데이터 분석] 이커머스 코호트 분석 기초 가이드", summary: "사용자 리텐션을 측정하는 가장 확실한 방법, 코호트 분석(Cohort Analysis)의 원리와 파이썬 구현 코드 공유.", author: "정태양", date: "2026.01.05", imageGrad: "from-slate-200 to-slate-300", link: "#" },
];

const ITEMS_PER_PAGE = 6;

const News = () => {
    const [activeFilter, setActiveFilter] = useState("전체보기");
    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterChange = (cat) => {
        setActiveFilter(cat);
        setCurrentPage(1);
    };

    const filteredNews = activeFilter === "전체보기"
        ? newsLog
        : newsLog.filter(post => post.category === activeFilter);

    const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));
    const paginatedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* 1. Hero Section */}
                <section className="mb-20 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl mx-auto">

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                            KBLs의 생생한 발자취와<br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-600"> 인사이트를 전합니다</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                            치열했던 프로젝트 회고부터 스터디 노트, <br className="hidden md:block" />랩실의 일상까지 KBLs의 모든 기록을 확인하세요
                        </p>
                    </motion.div>
                </section>

                {/* 2. Featured Post */}
                {activeFilter === "전체보기" && (
                    <section className="mb-24">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col lg:flex-row group">
                            <div className={`lg:w-1/2 min-h-[300px] lg:min-h-[500px] bg-gradient-to-br ${featuredPost.imageGrad} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center">

                                </div>
                            </div>
                            <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-4 py-1.5 bg-brand-50 text-brand-accent font-bold text-sm rounded-full tracking-wide">{featuredPost.category}</span>
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-snug group-hover:text-brand-accent transition-colors duration-300">{featuredPost.title}</h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-10 overflow-hidden line-clamp-3">{featuredPost.summary}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-slate-100 mt-auto">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center text-slate-500 text-sm font-medium"><User className="w-4 h-4 mr-2 text-slate-400" />{featuredPost.author}</div>
                                        <div className="flex items-center text-slate-500 text-sm font-medium"><Clock className="w-4 h-4 mr-2 text-slate-400" />{featuredPost.date}</div>
                                    </div>
                                    <a href={featuredPost.link} className="inline-flex items-center justify-center font-bold text-brand-accent hover:text-brand-700 transition-colors group/btn">
                                        본문 읽기 <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* 3. Category Filter & Content Grid */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <h3 className="text-2xl font-bold text-slate-900">
                            {activeFilter === "전체보기" ? "Latest KBLs Log" : `${activeFilter} 탭의 글`}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                            {categories.map((cat, idx) => (
                                <button key={idx} onClick={() => handleFilterChange(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {paginatedNews.map((post) => (
                                <motion.a href={post.link} key={post.id} layout
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                                    <div className={`w-full aspect-video bg-gradient-to-br ${post.imageGrad} relative overflow-hidden flex items-center justify-center`}>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-bold tracking-wider flex items-center">READ MORE <ArrowUpRight className="w-5 h-5 ml-1" /></span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col relative bg-white">
                                        <span className="text-xs font-extrabold text-brand-accent mb-4 tracking-wider">{post.category}</span>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3 leading-snug line-clamp-2 min-h-[3rem] group-hover:text-brand-accent transition-colors">{post.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-8 line-clamp-3 flex-1">{post.summary}</p>
                                        <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto text-xs text-slate-500 font-medium">
                                            <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5" /> {post.author}</span>
                                            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {post.date}</span>
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredNews.length === 0 && (
                        <div className="w-full py-20 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-100">
                            <p className="text-lg font-medium">해당 카테고리의 글이 없습니다.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-16">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${currentPage === page ? 'bg-slate-900 text-white shadow-md' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default News;
