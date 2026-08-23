import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

/**
 * 개인정보처리방침. 지원 폼이 개인정보를 수집하므로 공개 고지가 필요하다.
 *
 * 읽으라고 만든 문서 페이지라 등장 애니메이션을 넣지 않았다.
 * 수집 항목은 api/submitNotion.js가 실제로 노션에 저장하는 필드와
 * src/pages/Recruit.jsx의 required 표시를 대조해 적었다. 폼 필드를 고치면
 * 여기 1항도 함께 고쳐야 한다.
 *
 * GNB에는 노출하지 않고 푸터와 지원 폼의 고지 블록에서만 진입한다.
 */

const SECTION_TITLE = 'text-lg md:text-xl font-bold text-slate-900 mb-4';
const BODY = 'text-sm md:text-base text-slate-600 leading-relaxed';
const LIST = `${BODY} list-disc pl-5 space-y-2 marker:text-slate-400`;

const Privacy = () => {
    return (
        <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 md:pt-32 md:pb-32">
            <Seo
                path="/privacy"
                title="개인정보처리방침 | KBLs"
                description="KBLs가 수집하는 개인정보의 항목·목적·보유기간과 정보주체의 권리를 안내합니다."
            />

            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">

                    <header className="mb-12 md:mb-16 pb-8 border-b border-slate-200">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
                            개인정보처리방침
                        </h1>
                        <p className={BODY}>
                            KBLs(Key Bridge Leaders)는 신입 부원 모집 과정에서 지원자의 개인정보를 수집하며,
                            아래와 같이 처리합니다.
                        </p>
                    </header>

                    <div className="space-y-12">

                        <section>
                            <h2 className={SECTION_TITLE}>1. 수집하는 개인정보 항목</h2>
                            <p className={`${BODY} mb-4`}>
                                KBLs는 신입 부원 모집을 위해 지원서를 통해 아래 정보를 수집합니다.
                            </p>
                            <ul className={LIST}>
                                <li>
                                    <span className="font-semibold text-slate-800">필수 입력</span> — 이름, 학번, 학년, 학과,
                                    전화번호, 지원 동기 및 목적, 관심 분야 및 관심 직무, 공모전·프로젝트 경험,
                                    랩실 활동 참여 여부, 하고 싶은 활동
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">선택 입력</span> — 사용 가능한 툴
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">동의 기록</span> — 개인정보 수집·이용 동의 여부,
                                    랩실 활동 참여 및 운영 규정 확인 여부
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">자동 수집</span> — 방문 기록 등 웹사이트 이용 통계
                                    (Google Analytics, Vercel Analytics)
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={SECTION_TITLE}>2. 수집 및 이용 목적</h2>
                            <ul className={LIST}>
                                <li>신입 부원 모집 심사 및 선발</li>
                                <li>심사 결과 안내 및 후속 절차 연락</li>
                                <li>웹사이트 이용 현황 분석을 통한 서비스 개선</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={SECTION_TITLE}>3. 보유 및 이용 기간</h2>
                            <p className={BODY}>
                                모집 절차가 종료된 후 6개월 이내에 파기합니다. 다만 선발된 부원의 정보는
                                활동 기간 동안 보관하며, 활동이 종료되면 파기합니다.
                            </p>
                        </section>

                        <section>
                            <h2 className={SECTION_TITLE}>4. 개인정보의 처리 위탁</h2>
                            <p className={`${BODY} mb-4`}>
                                원활한 운영을 위해 아래 서비스를 이용하며, 해당 서비스의 서버에 정보가 저장됩니다.
                            </p>
                            <ul className={LIST}>
                                <li><span className="font-semibold text-slate-800">Notion Labs, Inc.</span> — 지원서 데이터 보관</li>
                                <li><span className="font-semibold text-slate-800">Vercel Inc.</span> — 웹사이트 호스팅</li>
                                <li><span className="font-semibold text-slate-800">Google LLC</span> — 웹사이트 이용 통계 분석</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={SECTION_TITLE}>5. 정보주체의 권리</h2>
                            <p className={`${BODY} mb-4`}>
                                지원자는 언제든지 본인의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.
                                아래 문의처로 연락 주시면 지체 없이 조치하겠습니다.
                            </p>
                            <p className={BODY}>
                                개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 지원서 접수가 제한됩니다.
                            </p>
                        </section>

                        <section>
                            <h2 className={SECTION_TITLE}>6. 개인정보 보호 책임자 및 문의처</h2>
                            <ul className={LIST}>
                                <li><span className="font-semibold text-slate-800">담당</span> — KBLs 운영진</li>
                                <li>
                                    <span className="font-semibold text-slate-800">이메일</span> —{' '}
                                    <a
                                        href="mailto:keybridgeleaders@gmail.com"
                                        className="text-brand-accent font-semibold hover:underline break-all"
                                    >
                                        keybridgeleaders@gmail.com
                                    </a>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={SECTION_TITLE}>7. 시행일</h2>
                            <p className={BODY}>이 방침은 2026년 8월 27일부터 시행합니다.</p>
                        </section>

                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-200">
                        <Link
                            to="/apply"
                            className="inline-flex items-center justify-center min-h-11 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-white transition-colors"
                        >
                            지원 페이지로 돌아가기
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Privacy;
