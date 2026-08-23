import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchBlockChildren, fetchPage, mapNewsPage } from '../lib/notion';
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
            setBlocks(await fetchBlockChildren(id));
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
            case 'heading_1':
                return <h1 key={id} className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-16 mb-8 tracking-tight leading-tight">{renderRichText(value.rich_text)}</h1>;
            case 'heading_2':
                return <h2 key={id} className="text-2xl md:text-3xl font-bold text-slate-900 mt-12 mb-6 pb-3 border-b border-slate-100">{renderRichText(value.rich_text)}</h2>;
            case 'heading_3':
                return <h3 key={id} className="text-xl md:text-2xl font-bold text-slate-800 mt-10 mb-4">{renderRichText(value.rich_text)}</h3>;
            case 'bulleted_list_item':
                return <li key={id} className="mb-2.5 text-slate-700 ml-6 list-disc marker:text-brand-accent/50 pl-2 leading-relaxed">{renderRichText(value.rich_text)}</li>;
            case 'numbered_list_item':
                return <li key={id} className="mb-2.5 text-slate-700 ml-6 list-decimal marker:text-brand-accent pl-2 leading-relaxed">{renderRichText(value.rich_text)}</li>;
            case 'image':
                const src = value.type === 'external' ? value.external.url : value.file.url;
                return (
                    <div key={id} className="my-12 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex justify-center w-full">
                        <img src={src} alt="Notion Block" className="max-w-full h-auto object-contain rounded-xl" />
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
            default:
                return <div key={id} className="hidden" data-type={type}></div>;
        }
    };

    return (
        <div className="min-h-screen bg-white relative">
            <Seo
                type="article"
                path={`/news/${id}`}
                title={`${post.title} | KBLs`}
                description={post.summary || `KBLs 소식 — ${post.title}`}
            />

            {/* 뒤로 가기 버튼: 텍스트나 박스 없이 깔끔한 <- 화살표 아이콘만 고정 배치 */}
            <button
                onClick={() => navigate('/news')}
                className="fixed top-24 left-6 md:top-32 md:left-12 z-50 p-2 text-slate-400 hover:text-brand-accent transition-colors"
                aria-label="목록으로 돌아가기"
            >
                <ArrowLeft className="w-8 h-8" strokeWidth={1.5} />
            </button>

            {/* 헤더 영역 (수직 Flex) */}
            <section className="pt-32 pb-12">
                <div className="container mx-auto px-6 max-w-3xl flex flex-col items-start gap-y-6">
                    {/* [1] tag 뱃지 */}
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-xs tracking-wider">
                        {post.tag || "소식"}
                    </span>

                    {/* [2] 아주 크고 굵은 title */}
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug">
                        {post.title}
                    </h1>

                    {/* [3] 연한 회색(text-gray-500 text-sm)의 date와 author */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{post.author}</span>
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
                            <ul className="list-none p-0 m-0 space-y-1">
                                {blocks.map((block, idx) => {
                                    const isBullet = block.type === 'bulleted_list_item';
                                    const isNumbered = block.type === 'numbered_list_item';
                                    const prevIsSame = idx > 0 && blocks[idx - 1].type === block.type;
                                    const nextIsSame = idx < blocks.length - 1 && blocks[idx + 1].type === block.type;

                                    let mt = prevIsSame ? 'mt-1.5' : 'mt-6';
                                    let mb = nextIsSame ? 'mb-1.5' : 'mb-8';

                                    if (isBullet || isNumbered) {
                                        const content = renderBlock(block);
                                        return React.cloneElement(content, { className: `${content.props.className} ${mt} ${mb}` });
                                    }
                                    return renderBlock(block);
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default NewsDetail;
