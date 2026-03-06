import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Medal, ExternalLink, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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

// Dummy Data for Awards
const awardsList = [
    { year: "2025", term: "2학기", title: "제 12회 전국 대학생 데이터 분석 경진대회 대상", org: "한국데이터산업진흥원", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" },
    { year: "2025", term: "1학기", title: "OO 금융 혁신 서비스 기획 공모전 최우수상", org: "OO은행", icon: Award, color: "text-blue-500", bg: "bg-blue-50" },
    { year: "2024", term: "2학기", title: "캠퍼스 타운 창업/해커톤 대회 우수상", org: "서울시 창업허브", icon: Medal, color: "text-slate-700", bg: "bg-slate-100" },
    { year: "2024", term: "1학기", title: "전국 ICT 아이디어 기획전 장려상", org: "정보통신산업진흥원", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
];

const categories = ["전체보기", "서비스 기획", "데이터 분석", "웹/앱 개발"];

const projectsList = [
    { id: 1, title: "EcoLink: 시니어 맞춤형 여가 매칭 플랫폼", category: "서비스 기획", summary: "디지털 소외계층인 시니어의 접근성을 최우선으로 고려한 UX/UI 설계 및 비즈니스 모델 기획안", imageGrad: "from-teal-400 to-emerald-600", tags: ["Figma", "Notion", "Business Model"], link: "#" },
    { id: 2, title: "수도권 대중교통 혼잡도 시계열 예측 모델", category: "데이터 분석", summary: "3개년 공공데이터를 활용하여 특정 정류장의 혼잡도를 예측하고 최적의 배차 간격을 제안하는 분석 결과보고서", imageGrad: "from-blue-500 to-indigo-600", tags: ["Python", "Pandas", "Scikit", "Tableau"], link: "#" },
    { id: 3, title: "K-Campus: 대학생 연합 동아리 리크루팅 서비스", category: "웹/앱 개발", summary: "기존 구글 폼 지원의 불편함을 해소하기 위해 개발된 자체 지원서 접수 및 결과 확인 웹 서비스 MVP", imageGrad: "from-violet-500 to-purple-700", tags: ["React", "TailwindCSS", "Node.js", "MongoDB"], link: "#" },
    { id: 4, title: "Z-Finance: Z세대를 위한 게이미피케이션 예적금", category: "서비스 기획", summary: "목표 달성 시 리워드를 제공하는 '챌린지형' 예적금 상품 기획. 타겟 퍼소나 설정 및 유저 저니 맵 도출", imageGrad: "from-rose-400 to-red-600", tags: ["Figma", "User Research", "Wireframe"], link: "#" },
    { id: 5, title: "이커머스 유저 이탈 방지 코호트 분석", category: "데이터 분석", summary: "특정 이커머스 쇼핑몰의 유저 로그 데이터를 활용하여 퍼널(Funnel)별 이탈 원인을 진단한 데이터 분석 프로젝트", imageGrad: "from-amber-400 to-orange-600", tags: ["SQL", "Google Analytics", "Python"], link: "#" },
    { id: 6, title: "FitMeet: 헬스장 파트너 틴더형 매칭 앱", category: "웹/앱 개발", summary: "운동 성향, 목표, 시간을 기반으로 동네 헬스 트레이닝 파트너를 매칭해주는 네이티브 앱 프로토타입", imageGrad: "from-cyan-500 to-blue-600", tags: ["React Native", "Firebase", "Zustand"], link: "#" },
];

const ITEMS_PER_PAGE = 6;

const Portfolio = () => {
    const [activeFilter, setActiveFilter] = useState("전체보기");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProjects = activeFilter === "전체보기"
        ? projectsList
        : projectsList.filter(p => p.category === activeFilter);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
    const paginatedProjects = filteredProjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterChange = (cat) => {
        setActiveFilter(cat);
        setCurrentPage(1);
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container mx-auto px-6">

                {/* 1. Hero Section */}
                <section className="mb-24 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl mx-auto">

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                            우리의 실력은 <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-600">결과물로 증명됩니다</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                            KBLs 멤버들이 치열하게 고민하고 만들어낸<br className="hidden md:block" />산출물과 그 발자취를 확인해 보세요
                        </p>
                    </motion.div>
                </section>

                {/* 2. Awards Section */}
                <section className="mb-32">
                    <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center">
                            <Trophy className="w-6 h-6 mr-3 text-brand-accent" /> History & Awards
                        </h3>
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="relative border-l-2 border-slate-100 ml-4 md:ml-6 space-y-12">
                            {awardsList.map((award, idx) => (
                                <motion.div key={idx} variants={fadeInUp} className="relative pl-8 md:pl-12">
                                    <div className={`absolute -left-[21px] top-1 w-10 h-10 ${award.bg} rounded-full border-4 border-white flex items-center justify-center shadow-sm`}>
                                        <award.icon className={`w-4 h-4 ${award.color}`} />
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8">
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-1">{award.title}</h4>
                                            <p className="text-slate-500 font-medium">{award.org}</p>
                                        </div>
                                        <div className="text-sm font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-3 py-1 rounded-md self-start md:self-auto">{award.year} {award.term}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 3. Project Outputs Gallery */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <h3 className="text-3xl font-bold text-slate-900">Featured Work</h3>
                        <div className="flex flex-wrap justify-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                            {categories.map((cat, idx) => (
                                <button key={idx} onClick={() => handleFilterChange(cat)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === cat ? 'bg-brand-accent text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {paginatedProjects.map((project) => (
                                <motion.a href={project.link} target="_blank" rel="noopener noreferrer" key={project.id} layout
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                                    className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col cursor-pointer">
                                    <div className={`w-full aspect-video bg-gradient-to-br ${project.imageGrad} relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 text-white flex items-center justify-center transition-all duration-300">
                                            <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center font-bold bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                                                자세히 보기 <ExternalLink className="w-4 h-4 ml-2" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col relative bg-white">
                                        <span className="text-xs font-extrabold text-brand-accent mb-3 tracking-wider">{project.category}</span>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3 leading-snug line-clamp-2">{project.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{project.summary}</p>
                                        <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 mt-auto">
                                                {project.tags.map((tag, tIdx) => (
                                                    <span key={tIdx} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredProjects.length === 0 && (
                        <div className="w-full py-20 text-center text-slate-500">
                            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">해당 카테고리의 프로젝트가 없습니다.</p>
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

export default Portfolio;
