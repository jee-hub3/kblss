import React from 'react';
import { Outlet } from 'react-router-dom';
import GNB from './GNB';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <GNB />
            <main className="flex-grow pt-0">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
