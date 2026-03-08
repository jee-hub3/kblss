import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Medal, ExternalLink, Sparkles, Filter, ChevronLeft, ChevronRight, Loader2, Info, Image as ImageIcon, Plus, Flag, Star, Circle, Rocket, Pin } from 'lucide-react';

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

const getHistoryIconProps = (iconTag) => {
    switch (iconTag) {
        case '대상':
            return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" };
        case '수상(대상 제외)':
            return { icon: Medal, color: "text-blue-500", bg: "bg-blue-50" };
        case '연혁':
            return { icon: Flag, color: "text-emerald-500", bg: "bg-emerald-50" };
        case '활동':
            return { icon: Rocket, color: "text-purple-500", bg: "bg-purple-50" };
        default:
            return { icon: Sparkles, color: "text-slate-400", bg: "bg-slate-100" };
    }
};

const defaultCategories = ["전체보기"];
const ITEMS_PER_PAGE = 6;

const Portfolio = () => {
    const navigate = useNavigate();
    const [projectsData, setProjectsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [historyData, setHistoryData] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Fetch Portfolios from Notion API
    const fetchPortfolios = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: `databases/${import.meta.env.VITE_NOTION_PORTFOLIO_DB_ID}/query`,
                    method: 'POST'
                })
            });

            if (!response.ok) {
                console.error("Failed to fetch Notion data", response.status, response.statusText);
                return;
            }

            const data = await response.json();

            const formattedData = data.results.map((item, index) => {
                const props = item.properties;
                // Assign gradients cyclically for generic fallback backgrounds
                const gradients = [
                    "from-teal-400 to-emerald-600",
                    "from-blue-500 to-indigo-600",
                    "from-violet-500 to-purple-700",
                    "from-rose-400 to-red-600",
                    "from-amber-400 to-orange-600",
                    "from-cyan-500 to-blue-600"
                ];

                const dateProp = props['기간']?.date;
                let dateStr = '';
                if (dateProp) {
                    const start = dateProp.start ? dateProp.start.replace(/-/g, '.') : '';
                    const end = dateProp.end ? dateProp.end.replace(/-/g, '.') : '';
                    dateStr = end ? `${start} ~ ${end}` : start;
                }

                return {
                    id: item.id,
                    title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
                    category: props['카테고리']?.select?.name || '기타',
                    summary: props['요약']?.rich_text?.[0]?.plain_text || '',
                    imageUrl: props['썸네일']?.files?.[0]?.file?.url || props['썸네일']?.files?.[0]?.external?.url || null,
                    tags: props['주요 사용 도구/작업']?.multi_select?.map(t => t.name) || [],
                    date: dateStr,
                    participants: props['참여']?.rich_text?.map(rt => rt.plain_text).join('') || '',
                    achievement: props['성과']?.rich_text?.map(rt => rt.plain_text).join('') || '',
                    link: props['링크']?.url || '#',
                    imageGrad: gradients[index % gradients.length],
                    createdAt: item.created_time
                };
            });

            setProjectsData(formattedData);

        } catch (error) {
            console.error("Error fetching portfolios from Notion:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await fetch('/api/notion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: `databases/${import.meta.env.VITE_NOTION_HISTORY_DB_ID}/query`,
                    method: 'POST'
                })
            });

            if (!response.ok) return;

            const data = await response.json();

            const formattedData = data.results.map((item) => {
                const props = item.properties;
                if (!props) return null; // Safe guard

                // Extract properties defensively
                const dateForSort = props['수상날짜']?.date?.start || '1970-01-01';

                return {
                    id: item.id,
                    title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
                    organization: props['주관']?.rich_text?.[0]?.plain_text || '',
                    dateBadge: props['표기날짜']?.formula?.string || '',
                    iconTag: props['아이콘태그']?.select?.name || '기타',
                    dateForSort
                };
            }).filter(Boolean); // Filter out any nulls

            // Sort descending by date (newest first)
            formattedData.sort((a, b) => {
                return new Date(b.dateForSort).getTime() - new Date(a.dateForSort).getTime();
            });

            setHistoryData(formattedData);

        } catch (error) {
            console.error("Error fetching history from Notion:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
        fetchHistory();
    }, []);

    // 2. 동적 카테고리 추출 로직 (Dynamic Tags)
    // 데이터에서 고유한 category 값들을 뽑아내어 ["전체보기", ...카테고리들] 배열 생성
    const dynamicCategories = React.useMemo(() => {
        const uniqueCats = Array.from(new Set(projectsData.map(p => p.category)));
        return [...defaultCategories, ...uniqueCats];
    }, [projectsData]);

    const [activeFilter, setActiveFilter] = useState("전체보기");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProjects = activeFilter === "전체보기"
        ? projectsData
        : projectsData.filter(p => p.category === activeFilter);

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
                            <span className="text-brand-accent">결과물</span>로 증명됩니다
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                            KBLs 멤버들이 치열하게 고민하고 만들어낸<br className="hidden md:block" />산출물과 그 발자취를 확인해 보세요
                        </p>
                    </motion.div>
                </section>

                {/* 2. Awards Section */}
                <section className="mb-32">
                    <div className="max-w-4xl mx-auto bg-transparent rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative">
                        <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center">
                            <Trophy className="w-6 h-6 mr-3 text-brand-accent" /> History & Awards
                        </h3>

                        {isLoadingHistory ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-brand-accent animate-spin mb-4" />
                                <p className="text-slate-500 font-medium text-sm">연혁 및 수상 내역을 불러오는 중입니다...</p>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-slate-100">
                                <Info className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">등록된 연혁이 없습니다.</p>
                            </div>
                        ) : (
                            <>
                                <div className="max-h-[500px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative z-0">
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-12 pb-40"
                                    >
                                        {historyData.map((award) => {
                                            const { icon: IconElement, color, bg } = getHistoryIconProps(award.iconTag);
                                            return (
                                                <motion.div key={award.id} variants={fadeInUp} className="relative pl-8 md:pl-12">
                                                    <div className={`absolute -left-[21px] top-1 w-10 h-10 ${bg} rounded-full border-4 border-slate-50 flex items-center justify-center shadow-sm z-10`}>
                                                        <IconElement className={`w-4 h-4 ${color}`} />
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8">
                                                        <div>
                                                            <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{award.title}</h4>
                                                            <p className="text-sm md:text-base text-slate-500 font-medium">{award.organization}</p>
                                                        </div>
                                                        <div className="text-xs md:text-sm font-bold text-slate-500 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm self-start md:self-auto">
                                                            {award.dateBadge}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </div>
                                {/* Bottom Fade Out Gradient Overlay */}
                                <div className="absolute bottom-0 left-0 w-full h-[60px] bg-gradient-to-t from-slate-50 to-transparent pointer-events-none rounded-b-[2rem] z-10" />
                            </>
                        )}
                    </div>
                </section>

                {/* 3. Project Outputs Gallery */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <h3 className="text-3xl font-bold text-slate-900">Featured Work</h3>

                        {!isLoading && projectsData.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                                {dynamicCategories.map((cat, idx) => (
                                    <button key={idx} onClick={() => handleFilterChange(cat)}
                                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === cat ? 'bg-brand-accent text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="w-full py-32 flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 text-brand-accent animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">노션(Notion) 서버에서 데이터를 무사히 모셔오는 중입니다...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="w-full py-20 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium tracking-tight">해당 조건에 맞는 프로젝트가 없거나, 아직 등록되지 않았습니다.</p>
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {paginatedProjects.map((project) => (
                                    <motion.div onClick={() => navigate(`/portfolio/${project.id}`, { state: { project } })} key={project.id} layout
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                                        className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col cursor-pointer">

                                        {/* Image Section */}
                                        <div className={`w-full aspect-video ${project.imageUrl ? 'bg-slate-100' : `bg-gradient-to-br ${project.imageGrad}`} relative overflow-hidden`}>
                                            {project.imageUrl ? (
                                                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                                                    <ImageIcon className="w-8 h-8 mb-2" />
                                                    <span className="text-sm font-bold">이미지가 없습니다</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                                                <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center font-bold text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                                                    자세히 보기 <Plus className="w-4 h-4 ml-2" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8 flex-1 flex flex-col relative bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-extrabold text-brand-accent tracking-wider">{project.category}</span>
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-3 leading-snug line-clamp-2">{project.title}</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 w-full break-keep">{project.summary}</p>

                                            {/* Bottom Tags Layout (Absolute/mt-auto positioning) */}
                                            <div className="mt-auto flex items-end justify-between pt-4 w-full">
                                                <div className="flex-1">
                                                    {project.achievement && (
                                                        <span className="text-[11px] font-bold text-brand-accent bg-brand-50 px-2.5 py-1 rounded-md line-clamp-1 border border-brand-100/50 inline-block max-w-[90%]">
                                                            {project.achievement}
                                                        </span>
                                                    )}
                                                </div>
                                                {project.date && (
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md shrink-0 ml-3">
                                                        {project.date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
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
