import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Loader2, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { queryDatabase, NOTION_DB } from '../lib/notion';
import DataNotice from '../components/DataNotice';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { fadeInUp, staggerContainer, tabPanelDirectional, VIEWPORT_ONCE } from '../lib/motion';

/* ── 블로그 전환 (오너 결정 2026-08-27) ─────────────────────────────
   이 페이지는 '소식(News)'이 아니라 '블로그'다. 공지성 글은 더 쓰지 않고
   회고·스터디 노트·인사이트를 쓴다. 라벨은 Blog, 경로는 /news 유지
   (기존 공유 링크·sitemap 보존 — navLinks.js 주석 참조).

   - 태그는 노션 select 4종이 단일 소스: 회고 / 스터디 노트 / 인사이트 / 랩실 일상.
     필터 탭은 실제 글에서 파생되므로 글이 없는 태그는 화면에 나타나지 않는다
     (빈 약속을 걸지 않는다 — Activities 스터디 절과 같은 원칙).
   - 페이지 순서는 히어로 → 추천 글 → 목록. 읽는 곳의 정체가 먼저 온다.
   - 썸네일은 16:9(aspect-video) 기준 — 오너가 16:9로 제작하기로 확정.
   - 카드에 '읽는 시간'은 넣지 않는다: 본문 글자 수가 필요해 목록에서
     글마다 블록 요청이 발생한다(노션 3rps 제한에 정면 충돌).
     읽는 시간은 본문을 이미 받는 상세 페이지(NewsDetail)에만 표시한다. */

/* '글 더 보기' 한 번에 이어 붙는 글 수 — 번호 페이지네이션은 시안 A 채택으로 폐기 */
const LIST_CHUNK = 6;

/* 추천 글 자동 넘김 주기. 구 뉴스 캐러셀의 3초는 제목만 읽기에도 짧았다 —
   추천 글은 요약까지 실리므로 6초로 늘린다. WCAG 2.2.2의 정지 수단은
   아래 일시정지 버튼이 담당한다. */
const AUTOPLAY_MS = 6000;

/* 썸네일이 없는 글의 대체 배경 — 인덱스 순환으로 고정 배정한다 */
const FALLBACK_GRADIENTS = [
    "from-teal-400 to-emerald-600",
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-700",
    "from-rose-400 to-red-600",
    "from-amber-400 to-orange-600",
    "from-cyan-500 to-blue-600",
];

/* 16:9 미디어 — 썸네일이 있으면 이미지, 없으면 그라데이션 위에 글 태그를 띄운다.
   추천 카드와 그리드 카드가 같은 규격을 공유한다(오너 확정: 썸네일은 16:9 제작). */
const PostMedia = ({ post, className = '', imgClassName = '' }) => (
    <div className={`aspect-video overflow-hidden ${post.thumbnail ? 'bg-slate-100' : `bg-gradient-to-br ${post.imageGrad}`} ${className}`}>
        {post.thumbnail ? (
            <img src={post.thumbnail} alt="" loading="lazy" className={`w-full h-full object-cover ${imgClassName}`} />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/70 font-extrabold text-lg tracking-[0.3em] uppercase drop-shadow-sm">KBLs</span>
            </div>
        )}
    </div>
);

const News = () => {
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newsError, setNewsError] = useState(false);

    // '다시 시도'에서 재호출하므로 useEffect 밖으로 뺀다.
    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        setNewsError(false);
        try {
            const results = await queryDatabase(NOTION_DB.news);

            const formattedData = results.map((item, index) => {
                const props = item.properties;

                // 작성일이 비어 있으면 노션 생성 시각으로 대체한다 — 블로그 목록은
                // 날짜 없는 글을 허용하지 않고, 없는 날짜를 지어내지도 않는다.
                const rawDate = props['작성일']?.date?.start || item.created_time?.slice(0, 10) || '';

                return {
                    id: item.id,
                    title: props['이름']?.title?.[0]?.plain_text || '제목 없음',
                    // 기본값 '랩실 일상' — '소식'은 블로그 전환으로 폐기됐다(notion.js와 동일).
                    tag: props['태그']?.select?.name || '랩실 일상',
                    category: props['태그']?.select?.name || '랩실 일상',
                    summary: props['요약']?.rich_text?.[0]?.plain_text || '',
                    author: props['작성자']?.rich_text?.[0]?.plain_text || 'KBLs',
                    thumbnail: props['썸네일']?.files?.[0]?.file?.url || props['썸네일']?.files?.[0]?.external?.url || null,
                    date: rawDate.replace(/-/g, '.'),
                    dateForSort: rawDate,
                    isFeatured: props['메인 지정']?.checkbox || false,
                    imageGrad: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
                };
            });

            // 최신 글이 먼저 — 노션 쿼리 순서에 기대지 않는다.
            formattedData.sort((a, b) => b.dateForSort.localeCompare(a.dateForSort));

            setNewsData(formattedData);

        } catch (error) {
            console.error("Error fetching blog posts from Notion:", error);
            setNewsError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchNews(); }, [fetchNews]);

    // 필터 탭은 실제 글의 태그에서 파생된다 — 밑줄 탭에 글 수를 함께 보여준다(시안 A)
    const categories = useMemo(() => {
        const counts = new Map();
        newsData.forEach(post => counts.set(post.category, (counts.get(post.category) || 0) + 1));
        return [
            { name: "전체보기", count: newsData.length },
            ...[...counts.keys()].map(name => ({ name, count: counts.get(name) })),
        ];
    }, [newsData]);

    const [activeFilter, setActiveFilter] = useState("전체보기");

    // 목록은 페이지 번호 대신 '글 더 보기'로 이어 붙인다(시안 A 채택, 2026-08-27).
    // 번호 페이지네이션은 라우트가 안 바뀌어 시점이 하단에 남는 문제를 스크롤
    // 복귀로 때웠는데, 이어 붙이기는 시점이 제자리인 게 올바른 동작이라
    // 문제 자체가 사라진다.
    const [visibleCount, setVisibleCount] = useState(LIST_CHUNK);

    /* 탭 전환 방향 — 오른쪽 탭으로 가면 목록이 오른쪽에서, 왼쪽 탭으로 가면
       왼쪽에서 들어온다(motion.js의 tabPanel). 방향을 안 주면 어느 탭을 눌러도
       같은 쪽에서 들어와 '옆으로 넘어가는' 느낌이 나지 않는다. */
    const [slideDir, setSlideDir] = useState(1);

    /* 탭 줄이 헤더 위로 밀려 올라가 있을 때만 목록 머리로 되돌린다.
       추천 글 섹션이 항상 남아 있어(오너 결정 2026-08-27) 예전처럼 화면이
       통째로 튀지는 않는다. 다만 긴 탭에서 짧은 탭으로 가면 문서가 짧아져
       브라우저가 스크롤을 강제로 당기므로, 그때는 탭 줄을 다시 보여준다.
       이미 보이는 상태라면 아무것도 하지 않는다 — 불필요한 이동을 만들지 않는다.

       ★ 스크롤은 반드시 렌더 이후(useEffect)에 부른다. onClick 안에서 부르면
       목록이 갈리기 전 좌표로 스크롤한다(/apply 제출 화면과 같은 함정). */
    const listSectionRef = useRef(null);
    const didMountRef = useRef(false);

    useEffect(() => {
        if (!didMountRef.current) { didMountRef.current = true; return; }
        const el = listSectionRef.current;
        if (!el) return;
        // 헤더(약 76px) + 여유. scroll-mt-28(112px)과 짝을 이룬다.
        if (el.getBoundingClientRect().top < 90) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeFilter]);

    const handleFilterChange = (cat) => {
        const from = categories.findIndex((c) => c.name === activeFilter);
        const to = categories.findIndex((c) => c.name === cat);
        setSlideDir(to >= from ? 1 : -1);
        setActiveFilter(cat);
        setVisibleCount(LIST_CHUNK);
    };

    const filteredNews = activeFilter === "전체보기"
        ? newsData
        : newsData.filter(post => post.category === activeFilter);

    const visibleNews = filteredNews.slice(0, visibleCount);
    const hasMore = filteredNews.length > visibleCount;

    /* ── 추천 글 캐러셀 상태 ──────────────────────────────
       일시정지는 세 겹이다: hover/focus(잠깐) · 버튼(사용자 의지, 고정) ·
       prefers-reduced-motion(전역 가드 — 자동 넘김은 framer 밖 JS 구동이라
       motion.js 기준 6항대로 개별 분기한다). */
    const featuredPosts = useMemo(() => newsData.filter(post => post.isFeatured), [newsData]);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [isHoverPaused, setIsHoverPaused] = useState(false);
    const [isUserPaused, setIsUserPaused] = useState(false);
    const prefersReducedMotion = useMemo(
        () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
        []
    );

    // 데이터가 다시 로드돼 추천 글 수가 줄면 인덱스를 안전한 범위로 되돌린다
    useEffect(() => {
        if (featuredIndex >= featuredPosts.length) setFeaturedIndex(0);
    }, [featuredPosts.length, featuredIndex]);

    const autoplayOff = prefersReducedMotion || isUserPaused || isHoverPaused || featuredPosts.length <= 1;

    useEffect(() => {
        if (autoplayOff) return;
        const timer = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % featuredPosts.length);
        }, AUTOPLAY_MS);
        return () => clearInterval(timer);
    }, [autoplayOff, featuredPosts.length]);

    const activeFeaturedIndex = featuredPosts.length ? featuredIndex % featuredPosts.length : 0;

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 md:pt-32 md:pb-32">
            <Seo {...ROUTE_META['/news']} />
            <div className="container mx-auto px-6 max-w-7xl">

                {/* 1. Hero — 이 페이지가 무엇을 읽는 곳인지 먼저 말한다 */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-4xl mb-16 md:mb-24"
                >
                    <motion.p variants={fadeInUp} className="text-label font-extrabold tracking-widest text-brand-accent mb-5">
                        KBLS BLOG
                    </motion.p>
                    <motion.h1
                        variants={fadeInUp}
                        className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3] mb-6 break-keep"
                    >
                        KBLs의 생생한 <span className="text-brand-accent">기록</span>과 <span className="text-brand-accent">인사이트</span>를 전합니다
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        className="text-sm md:text-base text-slate-600 leading-relaxed font-medium break-keep max-w-3xl"
                    >
                        공모전과 프로젝트의 회고, 스터디 노트, 우리가 주목한 인사이트까지.
                        <br className="hidden md:block" />KBLs가 함께 성장해 온 과정을 공유합니다.
                    </motion.p>
                </motion.section>

                {isLoading ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-brand-accent animate-spin mb-4" />
                        <p className="text-slate-500 font-medium tracking-wide">글을 불러오는 중입니다...</p>
                    </div>
                ) : newsError ? (
                    <DataNotice
                        title="데이터를 불러올 수 없습니다"
                        description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                        onRetry={fetchNews}
                    />
                ) : newsData.length === 0 ? (
                    <DataNotice title="아직 작성된 글이 없습니다" />
                ) : (
                    <>
                        {/* 2. 추천 글 — 슬라이드는 통째로 링크, 컨트롤(점·일시정지)은
                            스트립 밖 형제 요소라 링크 안에 버튼이 중첩되지 않는다.
                            ★ 태그 필터와 무관하게 항상 남는다(오너 결정 2026-08-27) —
                            전에는 '전체보기'에서만 보여서 탭을 누를 때마다 한 화면이
                            통째로 사라졌다 나타났다 했다. 추천 글은 태그가 아니라
                            '메인 지정' 체크박스가 고르는 것이라 필터와 축이 다르다. */}
                        {featuredPosts.length > 0 && (
                            <motion.section
                                initial="hidden"
                                whileInView="visible"
                                viewport={VIEWPORT_ONCE}
                                variants={fadeInUp}
                                className="mb-20 md:mb-28"
                            >
                                <p className="text-label font-extrabold tracking-widest text-slate-500 mb-6">추천 글</p>

                                <div
                                    onMouseEnter={() => setIsHoverPaused(true)}
                                    onMouseLeave={() => setIsHoverPaused(false)}
                                    onFocusCapture={() => setIsHoverPaused(true)}
                                    onBlurCapture={() => setIsHoverPaused(false)}
                                >
                                    <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
                                        <div
                                            className="flex transition-transform duration-500 ease-out"
                                            style={{ transform: `translateX(-${activeFeaturedIndex * 100}%)` }}
                                        >
                                            {featuredPosts.map((post, idx) => (
                                                /* inert — 화면 밖 슬라이드는 탭 초점·클릭에서 제외한다.
                                                   없으면 키보드 사용자가 안 보이는 링크를 순회하게 된다. */
                                                <div key={post.id} className="w-full flex-shrink-0" inert={idx !== activeFeaturedIndex}>
                                                    <Link
                                                        to={`/news/${post.id}`}
                                                        state={{ post }}
                                                        className="flex flex-col lg:flex-row h-full bg-white border border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group hover:shadow-xl hover:border-brand-accent/30 transition-all duration-500 focus-ring"
                                                    >
                                                        <div className="lg:w-7/12 relative overflow-hidden">
                                                            <PostMedia post={post} className="h-full min-h-full" imgClassName="group-hover:scale-105 transition-transform duration-700" />
                                                        </div>
                                                        <div className="lg:w-5/12 p-7 md:p-10 lg:p-12 flex flex-col justify-center">
                                                            <div className="flex items-center gap-3 mb-5">
                                                                <span className="px-3.5 py-1.5 bg-brand-50 text-brand-accent font-bold text-label rounded-full tracking-wide">{post.tag}</span>
                                                                <span className="text-label font-medium text-slate-500">{post.date}</span>
                                                            </div>
                                                            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-4 leading-[1.35] break-keep line-clamp-2 group-hover:text-brand-accent transition-colors">
                                                                {post.title}
                                                            </h2>
                                                            {post.summary && (
                                                                <p className="text-copy text-slate-600 line-clamp-3 break-keep font-medium mb-8">{post.summary}</p>
                                                            )}
                                                            <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-auto">
                                                                <div className="flex items-center text-slate-500 text-sm font-medium min-w-0">
                                                                    <User className="w-4 h-4 mr-2 text-slate-400 shrink-0" aria-hidden="true" />
                                                                    <span className="truncate">{post.author}</span>
                                                                </div>
                                                                <span className="inline-flex items-center shrink-0 font-bold text-brand-accent">
                                                                    본문 읽기 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 컨트롤 — 점 + 일시정지. reduced-motion이면 자동 넘김 자체가
                                        없으므로 정지 버튼은 빼고 수동 점만 남긴다. */}
                                    {featuredPosts.length > 1 && (
                                        <div className="mt-4 flex items-center justify-center gap-1">
                                            {featuredPosts.map((_, idx) => (
                                                // 점 자체는 작게 두되 버튼의 터치 영역은 44px를 확보한다
                                                <button
                                                    key={idx}
                                                    onClick={() => setFeaturedIndex(idx)}
                                                    className="group/dot flex h-11 w-11 items-center justify-center focus-ring rounded-full"
                                                    aria-label={`${idx + 1}번째 추천 글로 이동`}
                                                    aria-current={idx === activeFeaturedIndex}
                                                >
                                                    <span className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${idx === activeFeaturedIndex ? 'bg-brand-accent w-8' : 'w-2.5 bg-slate-300 group-hover/dot:bg-slate-400'}`} />
                                                </button>
                                            ))}
                                            {!prefersReducedMotion && (
                                                <>
                                                    <span aria-hidden="true" className="mx-2 h-4 w-px bg-slate-200" />
                                                    <button
                                                        onClick={() => setIsUserPaused((p) => !p)}
                                                        aria-pressed={isUserPaused}
                                                        aria-label={isUserPaused ? '자동 넘김 재생' : '자동 넘김 일시정지'}
                                                        className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors press focus-ring"
                                                    >
                                                        {isUserPaused
                                                            ? <Play className="w-4 h-4" aria-hidden="true" />
                                                            : <Pause className="w-4 h-4" aria-hidden="true" />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}

                        {/* 3. 글 목록 — 시안 A '세로 피드' (오너 채택 2026-08-27).
                            글이 주인공인 1열 읽기 컬럼(800px): 밑줄 탭 + 구분선 행,
                            썸네일은 우측 보조(모바일에서는 위로). 카드 그리드는 폐기.
                            위 추천 글 캐러셀은 현행 유지 — 같은 결정의 나머지 반쪽이다. */}
                        <section ref={listSectionRef} className="max-w-[50rem] mx-auto scroll-mt-28">
                            {/* 밑줄 탭 — 태그별 글 수를 함께 보여준다.
                                글 수는 슬레이트 규칙(밝은 배경 위 slate-500 이상)에 맞춘다. */}
                            {/* overflow-y-hidden이 필요한 이유는 index.css의 scrollbar-hide 주석 참조 —
                                overflow-x-auto만 주면 세로 스크롤바가 오른쪽에 딸려 온다 */}
                            <div className="flex gap-7 border-b border-slate-200 overflow-x-auto overflow-y-hidden scrollbar-hide">
                                {categories.map(({ name, count }) => (
                                    <button key={name} onClick={() => handleFilterChange(name)}
                                        aria-pressed={activeFilter === name}
                                        className={`shrink-0 min-h-11 px-0.5 pb-3 text-[15px] -mb-px border-b-2 transition-colors press focus-ring ${activeFilter === name
                                            ? 'font-extrabold text-slate-900 border-slate-900'
                                            : 'font-medium text-slate-500 hover:text-slate-700 border-transparent'}`}>
                                        {name} <span className="ml-1 font-bold text-slate-500">{count}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 목록은 '패널 하나'로 묶어 탭처럼 옆으로 전환한다(오너 결정 2026-08-27).
                                행마다 개별 등장/퇴장을 주면 태그를 바꿀 때 여러 줄이 제각기
                                흩어졌다 모이는 것처럼 보인다 — 탭 전환은 한 덩어리가 미끄러지는
                                게 맞다. mode="wait": 나간 뒤 들어와야 두 목록이 겹치지 않는다.
                                key가 activeFilter라 '글 더 보기'로 이어 붙일 때는 재생되지 않는다. */}
                            <AnimatePresence mode="wait" initial={false} custom={slideDir}>
                                <motion.div
                                    key={activeFilter}
                                    custom={slideDir}
                                    variants={tabPanelDirectional}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="flex flex-col"
                                >
                                    {visibleNews.map((post) => (
                                        /* 행은 div+onClick이 아니라 Link — 키보드로 열 수 있어야 한다 */
                                        <div key={post.id} className="border-b border-slate-100">
                                            <Link
                                                to={`/news/${post.id}`}
                                                state={{ post }}
                                                className="group flex flex-col md:flex-row md:items-center gap-5 md:gap-8 py-8 md:py-9 focus-ring rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0 flex flex-col gap-2.5 order-2 md:order-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-label font-bold text-brand-accent">{post.tag}</span>
                                                        <span className="text-label font-medium text-slate-500">{post.date}</span>
                                                    </div>
                                                    <h3 className="text-lg md:text-[21px] font-bold text-slate-900 leading-snug break-keep line-clamp-2 group-hover:text-brand-accent transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    {post.summary && (
                                                        <p className="text-[15px] text-slate-500 leading-relaxed break-keep line-clamp-2">{post.summary}</p>
                                                    )}
                                                    <p className="text-label font-medium text-slate-500 mt-0.5">{post.author}</p>
                                                </div>
                                                {/* 모바일은 썸네일이 위(order-1) — 시안 A의 전환 규칙 */}
                                                <PostMedia
                                                    post={post}
                                                    className="w-full md:w-[200px] shrink-0 rounded-xl order-1 md:order-2"
                                                    imgClassName="group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </Link>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>

                            {filteredNews.length === 0 && (
                                /* 데이터 0건은 위에서 이미 처리했으므로 여기는 필터 결과 0건이다 */
                                <DataNotice
                                    title="해당 태그의 글이 없습니다"
                                    description="다른 태그를 선택해 보세요."
                                    className="bg-white rounded-[2rem] border border-slate-100 mt-10"
                                />
                            )}

                            {hasMore && (
                                <div className="flex justify-center mt-10">
                                    <button onClick={() => setVisibleCount((c) => c + LIST_CHUNK)}
                                        className="min-h-11 px-10 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors press focus-ring">
                                        글 더 보기
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
