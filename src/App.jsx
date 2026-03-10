import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Organization from './pages/Organization'
import Activities from './pages/Activities'
import Portfolio from './pages/Portfolio'
import News from './pages/News'
import Recruit from './pages/Recruit'
import FAQ from './pages/FAQ'
import PortfolioDetail from './pages/PortfolioDetail'
import NewsDetail from './pages/NewsDetail'


function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>

                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="organization" element={<Organization />} />
                    <Route path="activities" element={<Activities />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    <Route path="portfolio/:id" element={<PortfolioDetail />} />
                    <Route path="news" element={<News />} />
                    <Route path="news/:id" element={<NewsDetail />} />
                    <Route path="apply" element={<Recruit />} />
                    <Route path="faq" element={<FAQ />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
