import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import GNB from './GNB';
import Footer from './Footer';
import KblsLoader from './KblsLoader';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <GNB />
            <main className="flex-grow pt-0">
                {/* 라우트 청크를 받는 동안에도 GNB/Footer는 그대로 유지된다 */}
                <Suspense fallback={<KblsLoader />}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
