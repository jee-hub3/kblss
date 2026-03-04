import React from 'react';
import { Outlet } from 'react-router-dom';
import GNB from './GNB';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <GNB />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
                <div className="container mx-auto px-6">
                    <p>© 2026 Key Bridge Leaders. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
