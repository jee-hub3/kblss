import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { fetchBlockChildren, fetchPage, hydrateNestedBlocks, mapNewsPage } from '../lib/notion';
import { buildHeadingTagMap, groupNotionBlocks, headingTagFor } from '../lib/notionBlocks';
import DataNotice from '../components/DataNotice';
import NotFound from './NotFound';
import Seo from '../components/Seo';

const NewsDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // 목록에서 넘어온 경우엔 state에 데이터가 실려 있어 곧바로 렌더한다.
    // 상세 URL을 공유받거나 새로고침한 경우엔 state가 없으므로 id로 직접 조회한다.
    const passedPost = location.state?.post;

    const [post, setPost] = useState(passedPost || null);
    const [isLoadingPost, setIsLoadingPost] = useState(!passedPost);
    // null | 'notfound'(없는 id) | 'error'(일시적 실패)
    const [postError, setPostError] = useState(null);

    const [blocks, setBlocks] = useState([]);
    // 블록 하나만 봐서는 태그 레벨을 정할 수 없어 배열 전체로 한 번 계산한다.
    const headingTagMap = useMemo(() => buildHeadingTagMap(blocks), [blocks]);

    // 예상 읽는 시간 — 본문 텍스트 총량 기준(한국어 약 500자/분, 최소 1분).
    // 본문 블록을 이미 받는 상세에서만 계산한다. 목록 카드에 넣으려면 글마다
    // 블록 요청이 필요해 노션 3rps 제한과 충돌한다 — 넣지 않기로 함(오너 승인 범위).
    const readingMinutes = useMemo(() => {
        const countRichText = (blockList) => (blockList || []).reduce((sum, block) => {
            const value = block?.[block.type];
            const own = (value?.rich_text || []).reduce((n, rt) => n + (rt.plain_text?.length || 0), 0);
            return sum + own + countRichText(block?.children);
        }, 0);
        const chars = countRichText(blocks);
        return chars ? Math.max(1, Math.round(chars / 500)) : 0;
    }, [blocks]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const fetchPost = useCallback(async () => {
        setIsLoadingPost(true);
        setPostError(null);
        try {
            setPost(mapNewsPage(await fetchPage(id)));
        } catch (error) {
            // 400은 id 형식 자체가 잘못된 경우라 404와 같이 '없는 페이지'로 본다.
            const notFound = error.status === 404 || error.status === 400;
            if (!notFound) console.error('Error fetching Notion page:', error);
            setPostError(notFound ? 'notfound' : 'error');
        } finally {
            setIsLoadingPost(false);
        }
    }, [id]);

    useEffect(() => {
        if (passedPost) return;
        fetchPost();
    }, [passedPost, fetchPost]);

    // '다시 시도'에서 재호출하므로 useEffect 밖으로 뺀다.
    const fetchBlocks = useCallback(async () => {
        setIsLoading(true);
        setLoadError(false);
        try {
            // 표의 행과 토글 본문은 별도 요청으로만 온다 — 최상위 블록을 받은 뒤
            // 자식을 품는 블록에만 children을 붙인다(notion.js 참조).
            setBlocks(await hydrateNestedBlocks(await fetchBlockChildren(id)));
        } catch (error) {
            console.error("Error fetching Notion blocks:", error);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (!post) return;

        fetchBlocks();
    }, [id, post, fetchBlocks]);

    // 없는 id면 기존 404 페이지를 그대로 쓴다(noindex 유지).
    if (postError === 'notfound') {
        return <NotFound />;
    }

    if (isLoadingPost) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-24">
                <div className="flex flex-col items-center justify-center opacity-60 space-y-6">
                    <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
                    <p className="font-bold text-slate-500 tracking-wide text-lg">노션 서버에서 상세 데이터를 불러오고 있습니다...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-24">
                <DataNotice
                    title="상세 데이터를 불러올 수 없습니다"
                    description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                    onRetry={fetchPost}
                    className="bg-slate-50 rounded-[2rem] border border-slate-100"
                />
            </div>
        );
    }

    const renderBlock = (block) => {
        const { type, id } = block;
        const value = block[type];

        const renderRichText = (richTextArray) => {
            if (!richTextArray) return null;
            return richTextArray.map((rt, idx) => {
                let classNames = [];
                if (rt.annotations.bold) classNames.push('font-bold');
                if (rt.annotations.italic) classNames.push('italic');
                if (rt.annotations.strikethrough) classNames.push('line-through');
                if (rt.annotations.underline) classNames.push('underline');
                if (rt.annotations.code) classNames.push('font-mono bg-slate-100 text-pink-500 px-1.5 py-0.5 rounded text-sm mx-0.5');
                if (rt.annotations.color !== 'default') classNames.push(`text-${rt.annotations.color}-500`);

                const textElement = <span key={idx} className={classNames.join(' ')}>{rt.plain_text}</span>;
                return rt.href ? <a key={idx} href={rt.href} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline font-medium">{textElement}</a> : textElement;
            });
        };

        switch (type) {
            case 'paragraph':
                return <p key={id} className="mb-5 text-slate-700 leading-loose min-h-[1.5rem] tracking-wide">{renderRichText(value.rich_text)}</p>;
            // 헤딩 태그 레벨은 문서별로 정규화한다(lib/notionHeadings.js).
            // 태그는 그 문서에서 쓰인 레벨을 h2부터 순서대로, 시각 클래스는
            // 블록 타입 그대로 — 둘을 분리해 화면은 그대로 두면서
            // h1 중복과 레벨 건너뜀을 코드가 보장한다.
            case 'heading_1': {
                const H1Tag = headingTagFor(headingTagMap, type);
                return <H1Tag key={id} className="text-heading font-extrabold text-slate-900 mt-16 mb-8 tracking-tight leading-tight">{renderRichText(value.rich_text)}</H1Tag>;
            }
            case 'heading_2': {
                const H2Tag = headingTagFor(headingTagMap, type);
                return <H2Tag key={id} className="text-2xl md:text-3xl font-bold text-slate-900 mt-12 mb-6 pb-3 border-b border-slate-100">{renderRichText(value.rich_text)}</H2Tag>;
            }
            case 'heading_3': {
                const H3Tag = headingTagFor(headingTagMap, type);
                return <H3Tag key={id} className="text-xl md:text-2xl font-bold text-slate-800 mt-10 mb-4">{renderRichText(value.rich_text)}</H3Tag>;
            }
            case 'bulleted_list_item':
                return <li key={id} className="mb-2.5 text-slate-700 ml-6 list-disc marker:text-brand-accent/50 pl-2 leading-relaxed">{renderRichText(value.rich_text)}</li>;
            case 'numbered_list_item':
                return <li key={id} className="mb-2.5 text-slate-700 ml-6 list-decimal marker:text-brand-accent pl-2 leading-relaxed">{renderRichText(value.rich_text)}</li>;
            case 'image':
                const src = value.type === 'external' ? value.external.url : value.file.url;
                return (
                    <div key={id} className="my-12 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex justify-center w-full">
                        <img src={src} alt={(value.caption || []).map((c) => c.plain_text).join('') } className="max-w-full h-auto object-contain rounded-xl" />
                    </div>
                );
            case 'callout':
                const icon = value.icon?.type === 'emoji' ? value.icon.emoji : '';
                return (
                    <div key={id} className="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                        {icon && <span className="text-2xl">{icon}</span>}
                        <div className="text-slate-700 leading-relaxed font-medium">
                            {renderRichText(value.rich_text)}
                        </div>
                    </div>
                );
            case 'quote':
                return (
                    <blockquote key={id} className="my-8 pl-6 border-l-4 border-brand-accent italic text-slate-600 font-medium text-lg bg-slate-50/50 py-4 pr-4 rounded-r-2xl">
                        {renderRichText(value.rich_text)}
                    </blockquote>
                );
            /* ── 블로그 전환(2026-08-27)으로 추가된 블록들 — 스터디 노트에 필수인
               코드 블록을 포함해, 지원하지 않으면 본문에서 조용히 사라지던 타입들이다. */
            case 'code': {
                const codeText = (value.rich_text || []).map((rt) => rt.plain_text).join('');
                const caption = (value.caption || []).map((c) => c.plain_text).join('');
                return (
                    <figure key={id} className="my-8">
                        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                            {value.language && value.language !== 'plain text' && (
                                <div className="px-5 pt-3 text-label font-bold tracking-widest text-slate-500 uppercase select-none">{value.language}</div>
                            )}
                            {/* 가로로 긴 코드는 블록 안에서만 스크롤한다 — 본문 폭을 밀지 않는다 */}
                            <pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="font-mono text-slate-100">{codeText}</code></pre>
                        </div>
                        {caption && <figcaption className="mt-2 px-1 text-label text-slate-500">{caption}</figcaption>}
                    </figure>
                );
            }
            case 'divider':
                return <hr key={id} className="my-12 border-t border-slate-200" />;
            case 'table': {
                // 행(table_row)은 hydrateNestedBlocks가 붙여 준 children에서 온다
                const rows = (block.children || []).filter((row) => row.type === 'table_row');
                if (rows.length === 0) return <div key={id} className="hidden" data-type={type}></div>;
                const headerRow = value.has_column_header ? rows[0] : null;
                const bodyRows = headerRow ? rows.slice(1) : rows;
                return (
                    <div key={id} className="my-8 overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm border-collapse">
                            {headerRow && (
                                <thead>
                                    <tr className="bg-slate-50">
                                        {headerRow.table_row.cells.map((cell, i) => (
                                            <th key={i} scope="col" className="px-4 py-3 text-left font-bold text-slate-700 border-b border-slate-200 whitespace-nowrap">{renderRichText(cell)}</th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {bodyRows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-100 last:border-0">
                                        {row.table_row.cells.map((cell, i) => (
                                            value.has_row_header && i === 0
                                                ? <th key={i} scope="row" className="px-4 py-3 text-left font-bold text-slate-700 bg-slate-50/60">{renderRichText(cell)}</th>
                                                : <td key={i} className="px-4 py-3 text-slate-600 leading-relaxed">{renderRichText(cell)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            case 'toggle':
                return (
                    <details key={id} className="my-6 group/toggle rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                        <summary className="cursor-pointer list-none px-6 py-4 font-bold text-slate-800 flex items-center gap-3 hover:bg-slate-50 transition-colors focus-ring">
                            <ChevronRight className="w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 group-open/toggle:rotate-90" aria-hidden="true" />
                            <span>{renderRichText(value.rich_text)}</span>
                        </summary>
                        {/* 토글 본문도 본문과 같은 규칙(목록 묶기 포함)으로 렌더한다 */}
                        <div className="px-6 pb-5 pt-1 text-base">{renderBlockList(block.children)}</div>
                    </details>
                );
            case 'bookmark': {
                let host = '';
                try { host = new URL(value.url).hostname.replace(/^www\./, ''); } catch { /* url이 비정상이어도 링크 자체는 살린다 */ }
                const caption = (value.caption || []).map((c) => c.plain_text).join('');
                return (
                    <a
                        key={id}
                        href={value.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="my-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 hover:border-brand-accent/40 hover:shadow-md transition-all group/bookmark focus-ring"
                    >
                        <span className="min-w-0">
                            <span className="block font-bold text-slate-800 truncate group-hover/bookmark:text-brand-accent transition-colors">{caption || host || value.url}</span>
                            <span className="block text-sm text-slate-500 truncate mt-1">{value.url}</span>
                        </span>
                        <ExternalLink className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
                    </a>
                );
            }
            default:
                return <div key={id} className="hidden" data-type={type}></div>;
        }
    };

    // 목록 묶기 규칙을 적용해 블록 배열을 렌더한다 — 본문과 토글 내부가 공유한다.
    const renderBlockList = (blockList) => groupNotionBlocks(blockList || []).map((group) => {
        if (group.kind !== 'list') return renderBlock(group.block);
        // 목록 항목이 연속한 구간만 ul/ol로 감싼다 — 본문 전체를 감싸면
        // h2·p가 목록의 직계 자식이 되고, 아무것도 감싸지 않으면
        // li가 목록 부모를 잃는다.
        const ListTag = group.tag;
        return (
            <ListTag key={group.key}>
                {group.items.map(({ block, mt, mb }) => {
                    const content = renderBlock(block);
                    return React.cloneElement(content, { className: `${content.props.className} ${mt} ${mb}` });
                })}
            </ListTag>
        );
    });

    return (
        <div className="min-h-screen bg-white relative">
            <Seo
                type="article"
                path={`/news/${id}`}
                title={`${post.title} | KBLs`}
                description={post.summary || `KBLs 블로그 — ${post.title}`}
            />

            {/* 뒤로가기는 PortfolioDetail과 같은 알약형으로 통일 — 형제 상세 페이지의
                모션·어포던스 언어가 달랐다(맨 화살표 vs 알약). */}
            <button
                onClick={() => navigate('/news')}
                className="fixed top-24 left-6 md:top-32 md:left-12 z-30 p-3 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-full text-slate-500 hover:text-brand-accent hover:bg-white hover:shadow-md transition-all press focus-ring group"
                aria-label="목록으로 돌아가기"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* 헤더 영역 (수직 Flex) */}
            <section className="pt-32 pb-12">
                <div className="container mx-auto px-6 max-w-3xl flex flex-col items-start gap-y-6">
                    {/* [1] tag 뱃지 — 기본값은 mapNewsPage와 동일('소식'은 블로그 전환으로 폐기) */}
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-label tracking-wider">
                        {post.tag || "랩실 일상"}
                    </span>

                    {/* [2] 아주 크고 굵은 title */}
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug">
                        {post.title}
                    </h1>

                    {/* [3] 연한 회색(text-gray-500 text-sm)의 date와 author.
                        읽는 시간은 본문 블록이 도착한 뒤에만 붙는다 — 0분을 표시하지 않는다. */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{post.author}</span>
                        {readingMinutes > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>{readingMinutes}분 읽기</span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* 본문: 여백(mt-12) 중앙 정렬(max-w-3xl) */}
            <section className="mt-12 pb-32">
                <div className="container mx-auto px-6 max-w-3xl min-h-[50vh]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center opacity-60 space-y-6 py-20">
                            <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                            <p className="font-bold text-slate-500 tracking-wide">내용을 불러오고 있습니다...</p>
                        </div>
                    ) : loadError ? (
                        <DataNotice
                            title="상세 데이터를 불러올 수 없습니다"
                            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                            onRetry={fetchBlocks}
                            className="bg-slate-50 rounded-[2rem] border border-slate-100"
                        />
                    ) : blocks.length === 0 ? (
                        <DataNotice
                            title="작성된 상세 내용이 없습니다"
                            className="bg-slate-50 rounded-[2rem] border border-slate-100"
                        />
                    ) : (
                        <div className="notion-renderer text-lg">
                            <div className="space-y-1">
                                {renderBlockList(blocks)}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default NewsDetail;
