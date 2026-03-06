import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12 border-b border-slate-800 pb-12">

                    {/* 1. Logo & Intro */}
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-block mb-6">
                            <span className="text-2xl font-black tracking-tighter text-white">KBLs</span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            단순한 프로젝트 팀이 아니라, 새로운 아이디어를 실현하고 실행력을 키우는 실전형 비즈니스 IT 연합입니다.
                        </p>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 tracking-wide">Menu</h4>
                        <ul className="space-y-4">

                            <li><Link to="/activities" className="hover:text-brand-400 transition-colors">Activities</Link></li>
                            <li><Link to="/portfolio" className="hover:text-brand-400 transition-colors">Portfolio</Link></li>
                            <li><Link to="/organization" className="hover:text-brand-400 transition-colors">Organization</Link></li>
                            <li><Link to="/news" className="hover:text-brand-400 transition-colors">Log & News</Link></li>
                            <li><Link to="/apply" className="hover:text-brand-400 transition-colors font-semibold text-brand-accent">Apply Now</Link></li>
                        </ul>
                    </div>

                    {/* 3. Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6 tracking-wide">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-slate-500 shrink-0" />
                                <span>성균관대학교 인문사회과학캠퍼스<br />인문경영관 212호</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-slate-500 shrink-0" />
                                <a href="mailto:official.kbls@gmail.com" className="hover:text-brand-400 transition-colors">official.kbls@gmail.com</a>
                            </li>
                            <li className="flex items-center mt-6">
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} KBLs (Key Bridge Leaders). All rights reserved.</p>
                    <div className="mt-4 md:mt-0 space-x-6">
                        <Link to="#" className="hover:text-white transition-colors">개인정보처리방침</Link>
                        <Link to="#" className="hover:text-white transition-colors">이용약관</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
