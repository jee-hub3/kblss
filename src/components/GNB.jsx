import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../lib/analytics';
import Button from './Button';
import { DUR, EASE_OUT } from '../lib/motion';
import { HEADER_LINKS } from '../lib/navLinks';
// 아이콘 크기는 src/lib/iconography.js 단일 소스에서 온다.
import { ICON } from '../lib/iconography';

/* ── z-index 층 규약 ──────────────────────────────
   페이지 콘텐츠 (sticky 포함)  ≤ z-30
   전역 오버레이 (모바일 메뉴)     z-40
   전역 헤더 (GNB)                z-50
   페이지 안에서 sticky/fixed를 새로 만들 때는 z-30 이하로.
   페이지 요소가 z-40 이상이면 모바일 메뉴 오버레이를 뚫는다 —
   /apply 탭바(z-40)와 상세 페이지 뒤로가기(z-50)에서 실제로 났던 충돌이다.
   ───────────────────────────────────────────── */
/* 메뉴 항목·순서는 src/lib/navLinks.js 단일 소스 — 푸터가 같은 값을 읽는다.
   헤더는 inHeader가 true인 것만 그린다(FAQ는 푸터에만 — 사유는 navLinks.js 주석). */
const navLinks = HEADER_LINKS;

const GNB = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    return (
        <>
            {/* transition-all이면 스크롤 문턱마다 의도치 않은 속성까지 애니메이트된다.
                실제로 바뀌는 padding·배경·그림자만 명시(motion.js 기준 4항의 절충 —
                padding은 layout 속성이지만 fixed 헤더라 아래 문서를 리플로우하지 않는다). */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,box-shadow] duration-300 ${scrolled || isMobileMenuOpen ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                    }`}
            >
                {/* gap-6: 로고·내비·CTA 세 덩어리의 최소 간격을 보장한다.
                    md(768px)에서는 로고 영역이 콘텐츠 폭(min-content)까지 차 있어
                    이게 없으면 로고와 첫 메뉴가 0px로 붙는다(겹치진 않지만 로고가
                    메뉴의 일부처럼 읽힌다). 내비를 좁혀도 그 여유는 전부 오른쪽
                    CTA 쪽으로 흘러가므로 간격은 여기서 만들어야 한다.
                    ★ 메뉴가 4개로 줄어든 뒤 실측해도 gap 없이는 여전히 0px다 —
                      항목 수와 무관한 문제라 그대로 둔다. 지우지 말 것. */}
                <div className="container mx-auto px-6 md:px-12 flex items-center gap-6">
                    {/* Left: Logo */}
                    <div className="flex-1">
                        <Link to="/" className="inline-flex items-center group" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="text-xl md:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-blue-500 to-teal-500">
                                {/* 모바일은 상시 노출 CTA가 추가돼 공간이 좁으므로 로고를 축약한다 */}
                                <span className="md:hidden font-extrabold">KBLs</span>
                                <span className="hidden md:inline">
                                    <span className="font-extrabold">K</span><span className="font-medium">ey </span>
                                    <span className="font-extrabold">B</span><span className="font-medium">ridge </span>
                                    <span className="font-extrabold">L</span><span className="font-medium">eader</span><span className="font-extrabold">s</span>
                                </span>
                            </span>
                            {/* 옆 텍스트가 이미 "KBLs"를 읽어주므로 로고는 장식(alt="")으로 둔다.
                                모바일에서는 제거 — 24px에서 필터+그라데이션이 뭉개지고,
                                로고+텍스트+CTA+햄버거로 빽빽한 공간을 CTA에 양보한다. */}
                            <img src="/kbls-logo.svg" alt="" className="hidden md:block w-6 h-6 ml-2" />
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation */}
                    {/* 항목 간격은 32px 하나로 둔다. FAQ가 5번째로 붙었을 때 md에서만
                        20px로 줄였었는데, FAQ가 헤더에서 빠져 4개가 된 뒤로는 불필요해
                        원래 값으로 되돌렸다(폭 압박은 위 gap-6이 해결한다). */}
                    <nav className="hidden md:flex space-x-8 items-center justify-center">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-sm font-medium text-slate-600 hover:text-brand-accent transition-colors focus-ring rounded-md"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Desktop CTA + Mobile Hamburger */}
                    <div className="flex-1 flex justify-end items-center gap-3">
                        {/* `hidden`은 Button 베이스의 inline-flex와 같은 우선순위라 지지 못한다.
                            미디어쿼리 변형(max-md:)은 항상 이기므로 이걸로 숨긴다. */}
                        <Button to="/apply" size="md" onClick={() => trackEvent('apply_cta_click', { location: 'gnb_desktop' })} className="max-md:hidden transform hover:-translate-y-0.5">
                            지원하기
                        </Button>

                        {/* 모바일 상시 노출 CTA — 햄버거를 열지 않아도 보이는 컴팩트 버튼.
                            location을 gnb_mobile_inline으로 구분해 데스크톱(gnb_desktop),
                            오버레이 내부(gnb_mobile)와 진입점별 성과를 나눠 본다. */}
                        <Button
                            to="/apply"
                            size="md"
                            onClick={() => trackEvent('apply_cta_click', { location: 'gnb_mobile_inline' })}
                            className="md:hidden"
                        >
                            지원하기
                        </Button>

                        {/* Hamburger button — mobile only */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors press focus-ring"
                            aria-label="메뉴 열기/닫기"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMobileMenuOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <X className={ICON.ui} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Menu className={ICON.ui} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Panel — fullscreen overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-lg md:hidden"
                    >
                        <motion.nav
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                            className="flex flex-col items-center justify-center h-full gap-2 px-8"
                        >
                            {navLinks.map((item, idx) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: DUR.base, ease: EASE_OUT, delay: 0.1 + idx * 0.06 }}
                                >
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-2xl font-bold text-slate-800 hover:text-brand-accent transition-colors py-4 px-6 rounded-2xl hover:bg-slate-50 text-center"
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: DUR.base, ease: EASE_OUT, delay: 0.1 + navLinks.length * 0.06 }}
                                className="mt-6 w-full max-w-xs"
                            >
                                <Button
                                    to="/apply"
                                    size="lg"
                                    onClick={() => {
                                        trackEvent('apply_cta_click', { location: 'gnb_mobile' });
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full"
                                >
                                    지원하기
                                </Button>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GNB;
