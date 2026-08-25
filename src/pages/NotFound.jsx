import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { fadeInUp } from '../lib/motion';
// 아이콘 크기는 src/lib/iconography.js 단일 소스에서 온다.
import { ICON } from '../lib/iconography';

const NotFound = () => {
    return (
        <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 md:pt-32 md:pb-32 flex items-center justify-center">
            <Seo {...ROUTE_META['/404']} />
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="container mx-auto px-6 max-w-xl text-center"
            >
                <p aria-hidden="true" className="text-7xl md:text-8xl font-extrabold text-slate-200 tracking-tight mb-6 select-none">404</p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">페이지를 찾을 수 없습니다</h1>
                <p className="text-slate-500 font-medium leading-relaxed mb-10 break-keep">
                    주소가 잘못 입력되었거나, 페이지가 이동 또는 삭제되었을 수 있습니다.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-all press focus-ring shadow-md"
                    >
                        <Home className={`${ICON.ui} mr-2`} />
                        홈으로
                    </Link>
                    <Link
                        to="/apply"
                        className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto px-6 py-3 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-semibold transition-all press focus-ring shadow-md"
                    >
                        지원하기
                        <ArrowRight className={`${ICON.ui} ml-2`} />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
