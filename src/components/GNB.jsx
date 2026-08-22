import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { name: 'Organization', path: '/organization' },
    { name: 'Activities', path: '/activities' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'News', path: '/news' }
];

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
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-6 md:px-12 flex items-center">
                    {/* Left: Logo */}
                    <div className="flex-1">
                        <Link to="/" className="inline-flex items-center group" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="text-xl md:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-blue-500 to-teal-500">
                                <span className="font-extrabold">K</span><span className="font-medium">ey </span>
                                <span className="font-extrabold">B</span><span className="font-medium">ridge </span>
                                <span className="font-extrabold">L</span><span className="font-medium">eader</span><span className="font-extrabold">s</span>
                            </span>
                            <img src="/kbls-logo.svg" alt="KBLs" className="w-6 h-6 ml-2" />
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center justify-center">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-sm font-medium text-slate-600 hover:text-brand-accent transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Desktop CTA + Mobile Hamburger */}
                    <div className="flex-1 flex justify-end items-center gap-3">
                        <Link to="/apply" className="hidden md:inline-block bg-brand-accent hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            지원하기
                        </Link>

                        {/* Hamburger button — mobile only */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="메뉴 열기/닫기"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMobileMenuOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <X className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Menu className="w-6 h-6" />
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
                                    transition={{ delay: 0.1 + idx * 0.06 }}
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
                                transition={{ delay: 0.1 + navLinks.length * 0.06 }}
                                className="mt-6 w-full max-w-xs"
                            >
                                <Link
                                    to="/apply"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full text-center bg-brand-accent hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg"
                                >
                                    KBLs 지원하기
                                </Link>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GNB;
