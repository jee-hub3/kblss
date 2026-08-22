import React, { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import AnalyticsTracker from './components/AnalyticsTracker'
import Home from './pages/Home'

// 진입 페이지인 Home만 초기 번들에 포함하고,
// 나머지 페이지는 실제로 방문할 때 각자의 청크로 받아온다.
// 청크를 받는 동안의 fallback은 Layout의 Suspense가 담당한다.
const Organization = lazy(() => import('./pages/Organization'))
const Activities = lazy(() => import('./pages/Activities'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'))
const News = lazy(() => import('./pages/News'))
const NewsDetail = lazy(() => import('./pages/NewsDetail'))
const Recruit = lazy(() => import('./pages/Recruit'))
const FAQ = lazy(() => import('./pages/FAQ'))
const NotFound = lazy(() => import('./pages/NotFound'))


function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AnalyticsTracker />
            <Analytics />
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
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
