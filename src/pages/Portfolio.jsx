import React, { useState, useEffect } from 'react';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { queryDatabase, NOTION_DB } from '../lib/notion';
import DataNotice from '../components/DataNotice';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { fadeInUp, gridItem, drawLineY, igniteIn } from '../lib/motion';
// 연혁 아이콘태그 매핑·아이콘 크기는 src/lib/iconography.js 단일 소스에서 온다.
import { ICON, getHistoryIconProps } from '../lib/iconography';

const defaultCategories = ["전체보기"];
const ITEMS_PER_PAGE = 6;

const Portfolio = () => {
    const navigate = useNavigate();
    const [projectsData, setProjectsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [portfolioError, setPortfolioError] = useState(false);

    const [historyData, setHistoryData] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState(false);

    // Fetch Portfolios from Notion API
    const fetchPortfolios = async () => {
        setIsLoading(true);
        setPortfolioError(false);
        try {
            const results = await queryDatabase(NOTION_DB.portfolio);

            const formattedData = results.map((item, index) => {
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
                let endDateForSort = '1970-01-01'; // Default fallback
                if (dateProp) {
                    const start = dateProp.start || '';
                    const end = dateProp.end || start;
                    endDateForSort = end;

                    const startStr = start.replace(/-/g, '.');
                    const endStr = dateProp.end ? dateProp.end.replace(/-/g, '.') : '';
                    dateStr = dateProp.end ? `${startStr} ~ ${endStr}` : startStr;
                }

                return {
                    id: item.id,
                    title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
                    category: props['카테고리']?.select?.name || '기타',
                    summary: props['요약']?.rich_text?.[0]?.plain_text || '',
                    imageUrl: props['썸네일']?.files?.[0]?.file?.url || props['썸네일']?.files?.[0]?.external?.url || null,
                    tags: props['주요 사용 도구/작업']?.multi_select?.map(t => t.name) || [],
                    date: dateStr,
                    endDateForSort,
                    participants: props['참여']?.rich_text?.map(rt => rt.plain_text).join('') || '',
                    achievement: props['성과']?.rich_text?.map(rt => rt.plain_text).join('') || '',
                    link: props['링크']?.url || '#',
                    imageGrad: gradients[index % gradients.length],
                    createdAt: item.created_time
                };
            });

            // Sort descending by end date (newest first)
            formattedData.sort((a, b) => {
                return new Date(b.endDateForSort).getTime() - new Date(a.endDateForSort).getTime();
            });

            setProjectsData(formattedData);

        } catch (error) {
            console.error("Error fetching portfolios from Notion:", error);
            setPortfolioError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        setHistoryError(false);
        try {
            const results = await queryDatabase(NOTION_DB.history);

            const formattedData = results.map((item) => {
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
            setHistoryError(true);
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
        <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 md:pt-32 md:pb-32">
            <Seo {...ROUTE_META['/portfolio']} />
            <div className="container mx-auto px-6">

                {/* 1. Hero Section */}
                <section className="mb-24 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl mx-auto">

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3] mb-6 break-keep">
                            우리의 실력은 <br className="md:hidden" />
                            <span className="text-brand-accent">결과물</span>로 증명됩니다
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium break-keep">
                            KBLs 멤버들이 치열하게 고민하고 만들어낸<br className="hidden md:block" />산출물과 그 발자취를 확인해 보세요
                        </p>
                    </motion.div>
                </section>

                {/* 2. Awards Section */}
                <section className="mb-32">
                    <div className="max-w-4xl mx-auto bg-transparent rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative">
                        <h2 className="text-subhead font-bold text-slate-900 mb-10 flex items-center">
                            <Trophy className={`${ICON.ui} mr-3 text-brand-accent`} /> History & Awards
                        </h2>

                        {isLoadingHistory ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className={`${ICON.display} text-brand-accent animate-spin mb-4`} />
                                <p className="text-slate-500 font-medium text-sm">연혁 및 수상 내역을 불러오는 중입니다...</p>
                            </div>
                        ) : historyError ? (
                            <DataNotice
                                title="데이터를 불러올 수 없습니다"
                                description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                                onRetry={fetchHistory}
                                className="bg-white/50 rounded-2xl border border-slate-100"
                            />
                        ) : historyData.length === 0 ? (
                            <DataNotice
                                title="등록된 연혁이 없습니다"
                                className="bg-white/50 rounded-2xl border border-slate-100"
                            />
                        ) : (
                            <>
                                <div className="max-h-[500px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative z-0">
                                    {/* 증거 연출(motion.js 참조): 항목 페이드업 대신, 타임라인
                                        선이 위→아래로 그려지고 노드가 순서대로 켜진다(발자취가
                                        쌓여 온 순서). 텍스트는 처음부터 그대로 있고, 노드만
                                        slate(아직)에서 카테고리 색(기록됨)으로 점등한다 —
                                        여기서는 카테고리 색이 정보(대상·수상·연혁·활동)라
                                        완료 색을 accent 하나로 뭉개지 않는다. 점등은 opacity
                                        크로스페이드(기준 4항), 시차는 igniteIn(cap)으로
                                        첫 화면에 보이는 노드까지만 순서를 연출한다. */}
                                    <motion.div
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        className="relative ml-4 md:ml-6 pb-40"
                                    >
                                        {/* 선은 흐름 밖(absolute)에 두고 목록만 space-y로 띄운다 —
                                            선이 형제로 끼면 space-y가 첫 항목에 여백을 얹는다. */}
                                        <motion.div
                                            variants={drawLineY}
                                            aria-hidden="true"
                                            className="absolute -left-0.5 top-1 bottom-0 w-0.5 bg-slate-200 origin-top"
                                        />
                                        <div className="space-y-12">
                                        {historyData.map((award, i) => {
                                            const { icon: IconElement, color, bg } = getHistoryIconProps(award.iconTag);
                                            return (
                                                <div key={award.id} className="relative pl-8 md:pl-12">
                                                    <div className="absolute -left-[21px] top-1 w-10 h-10 bg-slate-100 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-sm z-10">
                                                        <IconElement className={`${ICON.meta} text-slate-400`} aria-hidden="true" />
                                                        <motion.div
                                                            variants={igniteIn(i)}
                                                            className={`absolute inset-0 ${bg} rounded-full flex items-center justify-center`}
                                                        >
                                                            <IconElement className={`${ICON.meta} ${color}`} aria-hidden="true" />
                                                        </motion.div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8">
                                                        <div>
                                                            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">{award.title}</h3>
                                                            <p className="text-label text-slate-500 font-medium">{award.organization}</p>
                                                        </div>
                                                        <div className="text-label font-bold text-slate-500 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm self-start md:self-auto">
                                                            {award.dateBadge}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </div>
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
                        <h2 className="text-2xl font-bold text-slate-900">Featured Work</h2>

                        {!isLoading && projectsData.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                                {/* 활성 필터 색은 News 필터·양 페이지 페이지네이션과 같은
                                    slate-900로 통일 — brand-accent는 행동(CTA) 전용으로 남긴다 */}
                                {dynamicCategories.map((cat, idx) => (
                                    <button key={idx} onClick={() => handleFilterChange(cat)}
                                        className={`min-h-11 px-5 py-2 rounded-xl text-sm font-bold transition-all press focus-ring ${activeFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="w-full py-32 flex flex-col items-center justify-center">
                            <Loader2 className={`${ICON.display} text-brand-accent animate-spin mb-4`} />
                            <p className="text-slate-500 font-medium">노션(Notion) 서버에서 데이터를 무사히 모셔오는 중입니다...</p>
                        </div>
                    ) : portfolioError ? (
                        <DataNotice
                            title="데이터를 불러올 수 없습니다"
                            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                            onRetry={fetchPortfolios}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm"
                        />
                    ) : projectsData.length === 0 ? (
                        /* 데이터 자체가 없는 경우와 필터로 걸러진 경우는 원인이 달라 문구를 나눈다 */
                        <DataNotice
                            title="아직 등록된 프로젝트가 없습니다"
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm"
                        />
                    ) : filteredProjects.length === 0 ? (
                        <DataNotice
                            title="해당 조건에 맞는 프로젝트가 없습니다"
                            description="다른 카테고리를 선택해 보세요."
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm"
                        />
                    ) : (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {paginatedProjects.map((project) => (
                                    <motion.div onClick={() => navigate(`/portfolio/${project.id}`, { state: { project } })} key={project.id} layout
                                        {...gridItem}
                                        className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">

                                        {/* Image Section */}
                                        <div className={`w-full aspect-video ${project.imageUrl ? 'bg-slate-100' : `bg-gradient-to-br ${project.imageGrad}`} relative overflow-hidden`}>
                                            {project.imageUrl ? (
                                                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                                                    <ImageIcon className={`${ICON.ui} mb-2`} />
                                                    <span className="text-sm font-bold">이미지가 없습니다</span>
                                                </div>
                                            )}

                                            {/* 터치 기기에는 hover가 없으므로 모바일에서는 항상 노출하고,
                                                md 이상에서만 hover로 드러나게 한다 */}
                                            <div className="absolute inset-0 bg-black/20 md:bg-black/0 md:group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                                                <div className="opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 flex items-center font-bold text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                                                    자세히 보기 <Plus className={`${ICON.meta} ml-2`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8 flex-1 flex flex-col relative bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-label font-extrabold text-brand-accent tracking-wider">{project.category}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug line-clamp-2">{project.title}</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 w-full break-keep">{project.summary}</p>

                                            {/*KBLs의 새로운 소식을 확인해보세요*/}
                                            <div className="mt-auto flex items-end justify-between pt-4 w-full">
                                                <div className="flex-1">
                                                    {project.achievement && (
                                                        <span className="text-[11px] font-bold text-brand-accent bg-brand-50 px-2.5 py-1 rounded-md line-clamp-1 border border-brand-100/50 inline-block max-w-[90%]">
                                                            {project.achievement}
                                                        </span>
                                                    )}
                                                </div>
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
                                aria-label="이전 페이지"
                                className="w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all press focus-ring">
                                <ChevronLeft className={ICON.ui} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)}
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all press focus-ring ${currentPage === page ? 'bg-slate-900 text-white shadow-md' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                aria-label="다음 페이지"
                                className="w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all press focus-ring">
                                <ChevronRight className={ICON.ui} />
                            </button>
                        </div>
                    )}
                </section>

                {/* News CTA */}
                <section className="mt-24 text-center pb-8">
                    {/* hover 색은 하드코딩(blue-700) 대신 브랜드 토큰 — Button.jsx와 동일 */}
                    <button
                        onClick={() => navigate('/news')}
                        className="group inline-flex items-center bg-brand-accent hover:bg-brand-accent-hover text-white font-bold px-10 py-5 rounded-full text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 press focus-ring"
                    >
                        KBLs의 새로운 소식을 확인해보세요
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Portfolio;
