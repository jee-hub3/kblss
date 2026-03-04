import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GNB = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold tracking-tighter text-slate-900 group">
                    KBLs
                    <span className="text-brand-accent group-hover:block hidden absolute w-1 h-1 rounded-full bottom-0 right-0"></span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex space-x-8 items-center">
                    {[
                        { name: 'Organization', path: '/organization' },
                        { name: 'Activities', path: '/activities' },
                        { name: 'Portfolio', path: '/portfolio' },
                        { name: 'News', path: '/news' }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="text-sm font-medium text-slate-600 hover:text-brand-accent transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Action Button */}
                <div>
                    <Link to="/apply" className="inline-block bg-brand-accent hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        지원하기
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default GNB;
