import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar, Users, Wrench, Trophy } from 'lucide-react';
import { fetchBlockChildren } from '../lib/notion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const PortfolioDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Retrieve passed state from Portfolio.jsx
    const project = location.state?.project;

    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        if (!project) return;

        const fetchBlocks = async () => {
            setIsLoading(true);
            try {
                setBlocks(await fetchBlockChildren(id));
            } catch (error) {
                console.error("Error fetching Notion blocks:", error);
                setLoadError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlocks();
    }, [id, project]);

    // Fallback if accessed directly without state
    if (!project) {
        return <Navigate to="/portfolio" replace />;
    }

    // NotionRenderer
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

            {/* Detached Boxless Back Button (Icon Only) */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-24 left-6 md:top-32 md:left-12 z-50 p-3 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-full text-slate-400 hover:text-brand-accent hover:bg-white hover:shadow-md transition-all group"
                aria-label="포트폴리오 목록으로 돌아가기"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-slate-50 overflow-hidden border-b border-slate-100">
                {/* Decorative BG element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-brand-100/40 to-transparent rounded-bl-full pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto flex flex-col gap-y-6">

                        {/* [1st Row] Category Badge */}
                        <div className="flex items-center">
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-xs tracking-wider">
                                {project.category}
                            </span>
                        </div>

                        {/* [2nd Row] Main Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.2] lg:leading-[1.2]">
                            {project.title}
                        </h1>

                        {/* [3rd Row] Metadata 1 (Date, Participants, Achievement) */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 font-medium">
                            {project.date && (
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5 opacity-50" />
                                    <span>{project.date}</span>
                                </div>
                            )}

                            {project.participants && (
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1.5 opacity-50" />
                                    <span>{project.participants}</span>
                                </div>
                            )}

                            {project.achievement && (
                                <div className="flex items-center text-brand-accent">
                                    <Trophy className="w-4 h-4 mr-1.5 opacity-70" />
                                    <span className="font-bold">{project.achievement}</span>
                                </div>
                            )}
                        </div>

                        {/* [4th Row] Tools Badges */}
                        {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {project.tags.map((tool, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        )}

                    </motion.div>
                </div>
            </section>

            {/* Notion Blocks Body */}
            <section className="py-16 md:py-24 mt-4 md:mt-8">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto min-h-[50vh]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-6 py-32">
                                <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
                                <p className="font-bold text-slate-500 tracking-wide text-lg">노션 서버에서 상세 데이터를 불러오고 있습니다...</p>
                            </div>
                        ) : loadError ? (
                            <div className="text-center text-slate-500 py-32 font-medium bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold mb-3">상세 데이터를 불러올 수 없습니다</span>
                                <span className="text-base">일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</span>
                            </div>
                        ) : blocks.length === 0 ? (
                            <div className="text-center text-slate-500 py-32 font-medium bg-slate-50 rounded-[2rem] border border-slate-100">
                                작성된 상세 내용이 없습니다.
                            </div>
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
                </div>
            </section>

        </div>
    );
};

export default PortfolioDetail;
