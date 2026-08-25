import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { ORG_INFO } from '../lib/orgInfo';

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

                            <li><Link to="/activities" className="hover:text-brand-400 transition-colors focus-ring rounded-sm">Activities</Link></li>
                            <li><Link to="/portfolio" className="hover:text-brand-400 transition-colors focus-ring rounded-sm">Portfolio</Link></li>
                            <li><Link to="/organization" className="hover:text-brand-400 transition-colors focus-ring rounded-sm">Organization</Link></li>
                            <li><Link to="/news" className="hover:text-brand-400 transition-colors focus-ring rounded-sm">Log & News</Link></li>
                            <li><Link to="/faq" className="hover:text-brand-400 transition-colors focus-ring rounded-sm">FAQ</Link></li>
                            {/* 오너 결정: 푸터는 filled 버튼 대신 텍스트 링크를 유지한다
                                (메뉴 리스트의 결을 지킴). 문구 통일("지원하기")과
                                GA4 location: footer는 그대로 적용. 색은 어두운 배경 전용
                                토큰(brand-accent-on-dark) — index.css 주석 참고. */}
                            <li>
                                {/* 강조 링크의 hover가 brand-400으로 오히려 어두워지던 것을
                                    수정 — 다른 링크들과 반대 방향이었다. hover는 밝아져야 한다. */}
                                <Link
                                    to="/apply"
                                    onClick={() => trackEvent('apply_cta_click', { location: 'footer' })}
                                    className="hover:text-white transition-colors font-semibold text-brand-accent-on-dark focus-ring rounded-sm"
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
                                <span>{ORG_INFO.location.campus}<br />{ORG_INFO.location.room}</span>
                            </li>
                            {/* 이메일이 md 4컬럼 폭(~170px)보다 길어 scrollWidth를 넘겼다.
                                body overflow-x-hidden에 가려져 안 보였을 뿐 오버플로였다.
                                min-w-0(플렉스 자식 축소 허용) + break-all로 컬럼 안에서 줄바꿈. */}
                            <li className="flex items-center mt-4">
                                <Mail className="w-5 h-5 mr-3 text-slate-500 shrink-0" />
                                <a href={`mailto:${ORG_INFO.email}`} className="hover:text-brand-400 transition-colors min-w-0 break-all focus-ring rounded-sm">{ORG_INFO.email}</a>
                            </li>
                            {/* 인스타그램 링크는 두지 않는다 — 계정 URL이 없어서가 아니라
                                2026-08 운영진이 SNS 채널 자체를 폐기하기로 결정했다.
                                새 채널을 열기로 결정하기 전에는 복원하지 말 것. */}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} KBLs (Key Bridge Leaders). All rights reserved.</p>
                    {/* 이용약관은 계정·결제·사용자 게시물이 없어 규율할 대상이 없다.
                        링크가 하나뿐이라 space-x-6(항목 사이 간격)은 의미가 없어 걷어낸다. */}
                    <div className="mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors focus-ring rounded-sm">개인정보처리방침</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
