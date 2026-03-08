import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, User, ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const defaultCategories = ["전체보기"];

const ITEMS_PER_PAGE = 6;

const News = () => {
    const navigate = useNavigate();
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/notion-api/v1/databases/${import.meta.env.VITE_NOTION_NEWS_DB_ID}/query`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_NOTION_API_KEY}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.error("Failed to fetch Notion news data", response.status, response.statusText);
                    return;
                }

                const data = await response.json();

                const formattedData = data.results.map((item, index) => {
                    const props = item.properties;

                    const gradients = [
                        "from-teal-400 to-emerald-600",
                        "from-blue-500 to-indigo-600",
                        "from-violet-500 to-purple-700",
                        "from-rose-400 to-red-600",
                        "from-amber-400 to-orange-600",
                        "from-cyan-500 to-blue-600"
                    ];

                    const dateProp = props['작성일']?.date;
                    let dateStr = '';
                    if (dateProp) {
                        dateStr = dateProp.start ? dateProp.start.replace(/-/g, '.') : '';
                    }

                    return {
                        id: item.id,
                        title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
                        tag: props['태그']?.select?.name || '소식',
                        category: props['태그']?.select?.name || '소식', // For existing category filter logic
                        summary: props['요약']?.rich_text?.[0]?.plain_text || '',
                        author: props['작성자']?.rich_text?.[0]?.plain_text || 'KBLs',
                        thumbnail: props['썸네일']?.url || null,
                        date: dateStr,
                        isFeatured: props['메인 지정']?.checkbox || false,
                        imageGrad: gradients[index % gradients.length],
                        link: "#"
                    };
                });

                setNewsData(formattedData);

            } catch (error) {
                console.error("Error fetching news from Notion:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []);

    // 2. 동적 카테고리 추출 로직
    const dynamicCategories = React.useMemo(() => {
        const uniqueCats = Array.from(new Set(newsData.map(post => post.category)));
        return [...defaultCategories, ...uniqueCats];
    }, [newsData]);

    const [activeFilter, setActiveFilter] = useState("전체보기");
    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterChange = (cat) => {
        setActiveFilter(cat);
        setCurrentPage(1);
    };

    const filteredNews = activeFilter === "전체보기"
        ? newsData
        : newsData.filter(post => post.category === activeFilter);

    const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));
    const paginatedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const featuredPosts = newsData.filter(post => post.isFeatured);
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (featuredPosts.length <= 1 || isPaused) return;

        const timer = setInterval(() => {
            setCurrentFeaturedIndex((prev) => (prev + 1) % featuredPosts.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [featuredPosts.length, isPaused]);

    const featuredPostData = featuredPosts.length > 0 ? featuredPosts[currentFeaturedIndex] : null;

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container mx-auto px-6 max-w-7xl">

                {isLoading ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-brand-accent animate-spin mb-4" />
                        <p className="text-slate-500 font-medium tracking-wide">소식을 불러오는 중입니다...</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Featured Post (Moved to Top) */}
                        {activeFilter === "전체보기" && featuredPosts.length > 0 && (
                            <section className="mb-24">
                                <div
                                    onMouseEnter={() => setIsPaused(true)}
                                    onMouseLeave={() => setIsPaused(false)}
                                    className="relative overflow-hidden w-full pb-14"
                                >
                                    <div
                                        className="flex transition-transform duration-500 ease-in-out"
                                        style={{ transform: `translateX(-${currentFeaturedIndex * 100}%)` }}
                                    >
                                        {featuredPosts.map((post) => (
                                            <div key={post.id} className="w-full flex-shrink-0 px-2">
                                                <div
                                                    onClick={() => navigate(`/news/${post.id}`, { state: { post } })}
                                                    className="h-full bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col lg:flex-row group hover:shadow-xl hover:border-brand-accent/30 transition-all duration-500 cursor-pointer">
                                                    <div className={`lg:w-1/2 min-h-[350px] lg:min-h-[500px] ${post.thumbnail ? 'bg-slate-100' : `bg-gradient-to-br ${post.imageGrad}`} relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-700`}>
                                                        {post.thumbnail ? (
                                                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white/80 font-bold text-xl tracking-widest drop-shadow-md">FEATURED STORY</span>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                                    </div>
                                                    <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-white z-10 relative">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <span className="px-4 py-1.5 bg-brand-50 text-brand-accent font-bold text-sm rounded-full tracking-wide">{post.tag}</span>
                                                        </div>
                                                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-[1.3] break-keep group-hover:text-brand-accent transition-colors duration-300">{post.title}</h2>
                                                        <p className="text-lg text-slate-600 leading-relaxed mb-10 overflow-hidden line-clamp-3 break-keep font-medium">{post.summary}</p>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-slate-100 mt-auto">
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex items-center text-slate-500 text-sm font-medium"><User className="w-4 h-4 mr-2 text-slate-400" />{post.author}</div>
                                                                <div className="flex items-center text-slate-500 text-sm font-medium"><Clock className="w-4 h-4 mr-2 text-slate-400" />{post.date}</div>
                                                            </div>
                                                            <div className="inline-flex items-center justify-center font-bold text-brand-accent hover:text-brand-700 transition-colors group/btn">
                                                                본문 읽기 <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Indicators */}
                                    {featuredPosts.length > 1 && (
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                            {featuredPosts.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentFeaturedIndex(idx);
                                                    }}
                                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentFeaturedIndex ? 'bg-brand-accent w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
                                                    aria-label={`Go to slide ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* 2. Text Bridge Section (Formerly Hero) */}
                        <section className="mb-24 py-12 border-y border-slate-200/60 bg-slate-50/50">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="max-w-4xl mx-auto text-center px-4">
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-[1.4] mb-6 break-keep">
                                    KBLs의 생생한 <span className="text-brand-accent">발자취</span>와 <span className="text-brand-accent">인사이트</span>를 전합니다
                                </h2>
                                <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium break-keep">
                                    치열했던 프로젝트 회고부터 스터디 노트, 랩실의 일상까지 KBLs의 모든 기록을 확인하세요
                                </p>
                            </motion.div>
                        </section>

                        {/* 3. Category Filter & Content Grid */}
                        <section>
                            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {activeFilter === "전체보기" ? "Latest KBLs Log" : `${activeFilter} 탭의 글`}
                                </h3>
                                <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                    {dynamicCategories.map((cat, idx) => (
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
                                        <motion.div key={post.id} layout
                                            onClick={() => navigate(`/news/${post.id}`, { state: { post } })}
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="cursor-pointer group flex flex-col bg-transparent">

                                            <div className={`w-full aspect-video ${post.thumbnail ? 'bg-slate-100' : `bg-gradient-to-br ${post.imageGrad}`} rounded-2xl relative overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg`}>
                                                {post.thumbnail && (
                                                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                )}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white font-bold tracking-wider flex items-center">READ MORE <ArrowUpRight className="w-5 h-5 ml-1" /></span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start px-1 mt-4">
                                                <span className="inline-block bg-gray-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                                                    {post.tag}
                                                </span>
                                                <h4 className="mt-2 text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-brand-accent transition-colors">
                                                    {post.title}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                    {post.summary}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {filteredNews.length === 0 && (
                                <div className="w-full py-20 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-100">
                                    <p className="text-lg font-medium">해당 탭의 글이 없습니다.</p>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default News;
