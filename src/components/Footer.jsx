import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

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
                            단순한 프로젝트 팀이 아니라, 새로운 아이디어를 실현하고 실행력을 키우는 실전형 비즈니스 IT 랩실입니다.
                        </p>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h2 className="text-white font-bold mb-6 tracking-wide">Menu</h2>
                        <ul className="space-y-4">

                            <li><Link to="/activities" className="hover:text-brand-400 transition-colors">Activities</Link></li>
                            <li><Link to="/portfolio" className="hover:text-brand-400 transition-colors">Portfolio</Link></li>
                            <li><Link to="/organization" className="hover:text-brand-400 transition-colors">Organization</Link></li>
                            <li><Link to="/news" className="hover:text-brand-400 transition-colors">Log & News</Link></li>
                            <li><Link to="/faq" className="hover:text-brand-400 transition-colors">FAQ</Link></li>
                            {/* 오너 결정: 푸터는 filled 버튼 대신 텍스트 링크를 유지한다
                                (메뉴 리스트의 결을 지킴). 문구 통일("지원하기")과
                                GA4 location: footer는 그대로 적용. 색은 어두운 배경 전용
                                토큰(brand-accent-on-dark) — index.css 주석 참고. */}
                            <li>
                                <Link
                                    to="/apply"
                                    onClick={() => trackEvent('apply_cta_click', { location: 'footer' })}
                                    className="hover:text-brand-400 transition-colors font-semibold text-brand-accent-on-dark"
                                >
                                    지원하기
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Contact Info */}
                    <div>
                        <h2 className="text-white font-bold mb-6 tracking-wide">Contact</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-slate-500 shrink-0" />
                                <span>한국기술교육대학교 제1캠퍼스<br />인문경영관 212호</span>
                            </li>
                            {/* 이메일이 md 4컬럼 폭(~170px)보다 길어 scrollWidth를 넘겼다.
                                body overflow-x-hidden에 가려져 안 보였을 뿐 오버플로였다.
                                min-w-0(플렉스 자식 축소 허용) + break-all로 컬럼 안에서 줄바꿈. */}
                            <li className="flex items-center mt-4">
                                <Mail className="w-5 h-5 mr-3 text-slate-500 shrink-0" />
                                <a href="mailto:keybridgeleaders@gmail.com" className="hover:text-brand-400 transition-colors min-w-0 break-all">keybridgeleaders@gmail.com</a>
                            </li>
                            {/* 공유 링크의 igsi= 추적 파라미터는 떼고 정규 프로필 주소만 쓴다.
                                링크 텍스트는 계정 핸들 — "인스타그램"만 쓰면 어디로 가는지 안 보인다. */}
                            <li className="flex items-center mt-4">
                                <Instagram className="w-5 h-5 mr-3 text-slate-500 shrink-0" />
                                <a
                                    href="https://www.instagram.com/koreatech_kbls"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="KBLs 인스타그램 @koreatech_kbls (새 탭에서 열림)"
                                    className="hover:text-brand-400 transition-colors min-w-0 break-all"
                                >
                                    @koreatech_kbls
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} KBLs (Key Bridge Leaders). All rights reserved.</p>
                    {/* 이용약관은 계정·결제·사용자 게시물이 없어 규율할 대상이 없다.
                        링크가 하나뿐이라 space-x-6(항목 사이 간격)은 의미가 없어 걷어낸다. */}
                    <div className="mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
