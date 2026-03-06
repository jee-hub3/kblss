import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Organization from './pages/Organization'
import Activities from './pages/Activities'
import Portfolio from './pages/Portfolio'
import News from './pages/News'
import Apply from './pages/Apply'
import FAQ from './pages/FAQ'


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
                    <Route path="news" element={<News />} />
                    <Route path="apply" element={<Apply />} />
                    <Route path="faq" element={<FAQ />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
