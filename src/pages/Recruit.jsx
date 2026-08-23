import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { ROUTE_META } from '../lib/routeMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

// 서버가 돌려준 필드명을 화면 라벨로 바꿔 보여주기 위한 표.
// 폼 항목을 추가·변경하면 여기도 함께 고쳐야 안내가 어긋나지 않는다.
const FIELD_LABELS = {
    name: '이름',
    studentId: '학번',
    grade: '학년',
    major: '학과(전공)',
    phone: '전화번호',
    motivation: '지원 동기 · 목적',
    interest: '관심 분야 · 관심 직무',
    experience: '공모전·프로젝트 경험',
    participation: '랩실 활동 참여',
    futurePlan: '하고 싶은 활동',
    agreement: '랩실 활동 참여 및 운영 규정 확인',
    privacyAgreement: '개인정보 수집·이용 동의',
};

const Recruit = () => {
    // 탭 상태는 URL 쿼리(?tab=form)가 단일 기준이다. /apply?tab=form 딥링크로
    // 지원서 탭을 바로 열 수 있고, 그 외 값과 파라미터 없음은 info로 폴백한다.
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'form' ? 'form' : 'info'; // "info" or "form"

    // 기존 호출부(탭 버튼, 안내 탭 CTA, 제출 후 복귀)를 그대로 쓰기 위해
    // 같은 이름의 세터를 유지한다. replace로 히스토리 오염을 막는다.
    const setActiveTab = (tab) => {
        setSearchParams(tab === 'form' ? { tab: 'form' } : {}, { replace: true });
    };

    // 탭 버튼과 안내 탭의 CTA 두 경로로 진입하므로,
    // onClick마다 심지 않고 활성 탭 변화를 한 곳에서 감지한다.
    // activeTab이 URL에서 파생된 문자열이라 ?tab=form 직접 진입 시에도 1회 발생하고,
    // 같은 탭 내 리렌더(다른 쿼리 변경 등)로는 재발화하지 않는다.
    useEffect(() => {
        if (activeTab === "form") {
            trackEvent('apply_form_tab_view');
        }
    }, [activeTab]);
    const [openAccordion, setOpenAccordion] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        grade: '',
        major: '',
        phone: '',
        tools: [],
        motivation: '',
        interest: '',
        participation: '',
        futurePlan: '',
        agreement: false,
        privacyAgreement: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 개인정보 고지 블록 접힘 상태와 미동의 제출 시 인라인 안내
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [privacyError, setPrivacyError] = useState(false);

    const toggleAccordion = (idx) => {
        setOpenAccordion(openAccordion === idx ? null : idx);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return { ...prev, tools: [...prev.tools, value] };
            } else {
                return { ...prev, tools: prev.tools.filter(t => t !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 개인정보 수집·이용 미동의 시 제출 차단.
        // 체크박스에도 required가 걸려 있어 보통은 네이티브 검증이 먼저 막지만,
        // 자바스크립트로 폼을 제출하는 경로(requestSubmit 미사용 등)까지 대비해
        // 여기서도 한 번 더 검증한다. 서버(api/submitNotion.js)도 별도로 막는다.
        if (!formData.privacyAgreement) {
            setPrivacyError(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/submitNotion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                trackEvent('apply_submit_success');
                alert('지원이 성공적으로 완료되었습니다! KBLs에 지원해주셔서 감사합니다.');
                setFormData({
                    name: '', studentId: '', grade: '', major: '', phone: '',
                    tools: [], motivation: '', interest: '', experience: '', participation: '', futurePlan: '',
                    agreement: false, privacyAgreement: false
                });
                setActiveTab("info");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // 서버 응답 원문은 콘솔에만 남긴다. 화면에 JSON을 그대로 띄우면
                // 내부 구조가 드러나고, 사용자는 무엇을 고쳐야 할지 알 수 없다.
                console.error('지원서 제출 실패:', response.status, data);

                // 서버가 비어 있는 항목을 알려주면 화면 라벨로 바꿔 안내한다.
                const missing = Array.isArray(data.missingFields)
                    ? data.missingFields.map((f) => FIELD_LABELS[f] || f)
                    : [];
                alert(
                    missing.length > 0
                        ? '다음 항목을 확인해 주세요: ' + missing.join(', ')
                        : '지원서를 제출하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.'
                );
            }
        } catch (error) {
            console.error("Form submission error:", error);
            alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen pt-24 pb-16 md:pt-32 md:pb-32 flex flex-col items-center">
            <Seo {...ROUTE_META['/apply']} />
            <div className="w-full max-w-3xl px-6">

                {/* 1. Header (공통 상단 - Left Aligned) */}
                <header className="mb-12 text-left">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4 break-keep">
                        26학년도 상반기 KBLs 신입 회원 모집<br />
                        <span className="text-lg md:text-2xl text-slate-500 font-bold block mt-3">(학사 신입/재학생)</span>
                    </h1>
                    <p className="text-base text-slate-600 font-medium mt-6 break-keep">
                        "스스로 문제를 정의하고 해결하고 싶다면, KBLs와 함께하세요."
                    </p>
                </header>

                {/* 2. Tab Navigation (탭 메뉴 - Sticky, Left Aligned) */}
                <div className="sticky top-[80px] bg-slate-50 z-40 flex border-b border-slate-200 mb-10 pt-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`pb-4 font-bold text-lg transition-colors relative ${activeTab === "info" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            모집 정보
                            {activeTab === "info" && (
                                <motion.div
                                    layoutId="applyTabIndicator"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("form")}
                            className={`pb-4 font-bold text-lg transition-colors relative ${activeTab === "form" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            지원서 작성
                            {activeTab === "form" && (
                                <motion.div
                                    layoutId="applyTabIndicator"
                                    className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Tab Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait" custom={activeTab}>
                        {activeTab === "info" ? (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full space-y-14 pb-12"
                            >
                                {/* 모집 대상 */}
                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">모집 대상</h2>
                                    <ul className="list-disc pl-6 space-y-3 text-slate-700 font-medium text-base leading-relaxed">
                                        <li>데이터 분석 실전 적용 희망자</li>
                                        <li>공모전 완주 목표자</li>
                                        <li>책임감 있게 팀 활동이 가능한 분</li>
                                    </ul>
                                </section>

                                {/* 핵심 혜택 */}
                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">KBLs만의 핵심 혜택</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { emoji: "✨", text: "유료 생성형 AI 서비스 지원" },
                                            { emoji: "🏢", text: "인문경영관 212호 전용 학습 공간 제공" },
                                            { emoji: "☕", text: "비품 및 간식 무제한" },
                                            { emoji: "🎓", text: "필수 자격증 취득 비용 전폭 지원" }
                                        ].map((benefit, i) => (
                                            <div key={i} className="flex items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="text-xl mr-4 flex-shrink-0">
                                                    {benefit.emoji}
                                                </div>
                                                <span className="font-bold text-slate-800 text-sm leading-snug">{benefit.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* 상세 모집 일정 (타임라인) */}
                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">상세 모집 일정</h2>
                                    <div className="relative pl-7 border-l-2 border-slate-200 space-y-10 ml-2">
                                        {[
                                            { date: "3/02~3/17", title: "서류 접수" },
                                            { date: "3/18", title: "서류 발표" },
                                            { date: "3/18~3/24", title: "면접" },
                                            { date: "3/25", title: "최종 발표" }
                                        ].map((step, i) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[35px] top-1.5 w-4 h-4 bg-slate-400 rounded-full ring-4 ring-slate-50 relative z-10" />
                                                <div className="text-base font-bold text-brand-600 mb-1 tracking-wide">{step.date}</div>
                                                <div className="font-extrabold text-lg text-slate-900">{step.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Rules & Duties (아코디언) */}
                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">Rules & Duties</h2>
                                    <div className="space-y-4">
                                        {[
                                            { title: "활동 의무", content: "학기당 공모전/스터디 1회 필수, 화요일 정기 모임" },
                                            {
                                                title: "경고 규정", content: (
                                                    <div className="space-y-4">
                                                        <p className="font-bold text-slate-800">다음의 경우 사전 면담을 거쳐 경고 1회를 부여</p>
                                                        <ul className="list-inside list-disc pl-2 space-y-2 text-slate-600">
                                                            <li>공모전 또는 스터디에 반복적으로 참여하지 않는 경우</li>
                                                            <li>사전 협의 없는 중도 이탈/이유 없는 무단 결석이 2회 이상 발생</li>
                                                        </ul>
                                                        <p className="pt-2 text-sm text-slate-500">상세 내용이 궁금하시면 문의 부탁드립니다.</p>
                                                    </div>
                                                )
                                            }
                                        ].map((rule, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all">
                                                <button
                                                    onClick={() => toggleAccordion(i)}
                                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 text-base hover:bg-slate-50"
                                                >
                                                    {rule.title}
                                                    <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${openAccordion === i ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openAccordion === i && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-6 pt-0 text-slate-600 font-medium text-base leading-relaxed bg-white border-t border-slate-50">
                                                                {rule.content}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* 하단 버튼 - Text Left to match Daangn layout style */}
                                <div className="pt-10 pb-20">
                                    <button
                                        onClick={() => {
                                            setActiveTab("form");
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-lg shadow-md transition-all flex items-center justify-center"
                                    >
                                        지원서 작성하기
                                    </button>
                                </div>
                            </motion.div>

                        ) : (

                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full flex flex-col pb-20"
                            >
                                <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm mb-12 p-8 md:p-12">
                                    <div className="mb-10 text-center">
                                        <h2 className="text-xl font-bold text-slate-900 mb-3">2026 KBLs 상반기 지원서</h2>
                                        <p className="text-slate-500 font-medium">아래 항목을 꼼꼼히 작성한 후 제출해주세요.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
                                        {/* 기본 인적 사항 */}
                                        <div className="space-y-6 bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl">
                                            <h3 className="font-bold text-base text-slate-800 mb-4 border-b border-slate-200 pb-2">기본 인적사항</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold text-slate-700">1. 이름 <span className="text-brand-accent">*</span></label>
                                                    <input
                                                        type="text" name="name" required
                                                        value={formData.name} onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                        placeholder="홍길동"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold text-slate-700">2. 학번 <span className="text-brand-accent">*</span></label>
                                                    <input
                                                        type="number" name="studentId" required
                                                        value={formData.studentId} onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                        placeholder="202612345"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold text-slate-700">3. 학년 <span className="text-brand-accent">*</span></label>
                                                    <select
                                                        name="grade" required
                                                        value={formData.grade} onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium appearance-none"
                                                    >
                                                        <option value="" disabled>학년을 선택해주세요</option>
                                                        {['1학년', '2학년', '3학년', '4학년', '5학년', '휴학중'].map(g => (
                                                            <option key={g} value={g}>{g}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold text-slate-700">4. 학과(전공) <span className="text-brand-accent">*</span></label>
                                                    <input
                                                        type="text" name="major" required
                                                        value={formData.major} onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                        placeholder="컴퓨터공학부"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">5. 전화번호 <span className="text-brand-accent">*</span></label>
                                                <input
                                                    type="tel" name="phone" required
                                                    value={formData.phone} onChange={handleInputChange}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                    placeholder="010-XXXX-XXXX"
                                                />
                                            </div>
                                        </div>

                                        {/* 역량 확인 */}
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="block text-sm font-bold text-slate-700">6. 사용 가능한 툴 <span className="text-slate-400 font-medium">(선택)</span></label>
                                                <p className="text-xs text-slate-500 mb-2">본인이 다룰 줄 알거나 경험해본 툴을 모두 선택해주세요.</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {['Excel', 'Python', 'R', 'Notion', 'Figma', '기타(커서 등)', '없음(배워보고싶음)'].map((tool) => (
                                                        <label key={tool} className="flex items-center space-x-2 cursor-pointer group">
                                                            <input
                                                                type="checkbox" value={tool}
                                                                checked={formData.tools.includes(tool)}
                                                                onChange={handleCheckboxChange}
                                                                className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                                                            />
                                                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{tool}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 상세 서술 영역 */}
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">7. 지원 동기 · 목적 <span className="text-brand-accent">*</span></label>
                                                <p className="text-xs text-slate-500 mb-2">KBLs에 지원하게 된 계기와 이를 통해 이루고자 하는 개인적인 목표를 서술해주세요.</p>
                                                <textarea
                                                    name="motivation" required rows={4}
                                                    value={formData.motivation} onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                    placeholder="내용을 입력해주세요."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">8. 관심 분야 · 관심 직무 <span className="text-brand-accent">*</span></label>
                                                <p className="text-xs text-slate-500 mb-2">데이터 분석, 개발, 디자인, 기획 등 평소 관심 있는 분야나 희망 직무를 알려주세요.</p>
                                                <textarea
                                                    name="interest" required rows={3}
                                                    value={formData.interest} onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                    placeholder="내용을 입력해주세요."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">9. 공모전·프로젝트 경험 <span className="text-brand-accent">*</span></label>
                                                <p className="text-xs text-slate-500 mb-2">과거 진행했던 팀 프로젝트나 교내외 공모전 경험이 있다면 자유롭게 서술해주세요. (없으면 '없음'으로 기재)</p>
                                                <textarea
                                                    name="experience" required rows={4}
                                                    value={formData.experience} onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                    placeholder="내용을 입력해주세요."
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-sm font-bold text-slate-700">10. 랩실 활동 참여 <span className="text-brand-accent">*</span></label>
                                                <p className="text-xs text-slate-500 mb-2">화요일 정기 모임 및 오프라인 랩실 활동 참여가 가능하신가요?</p>
                                                <div className="flex space-x-6">
                                                    {['예', '어려울 것 같다'].map((opt) => (
                                                        <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="radio" name="participation" value={opt} required
                                                                checked={formData.participation === opt}
                                                                onChange={handleInputChange}
                                                                className="w-4 h-4 text-brand-500 border-slate-300 focus:ring-brand-500"
                                                            />
                                                            <span className="text-sm font-medium text-slate-700">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">11. 하고 싶은 활동 <span className="text-brand-accent">*</span></label>
                                                <p className="text-xs text-slate-500 mb-2">KBLs 합격 시 가장 주도적으로 참여해보고 싶은 스터디나 프로젝트 아이디어를 적어주세요.</p>
                                                <textarea
                                                    name="futurePlan" required rows={3}
                                                    value={formData.futurePlan} onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                    placeholder="내용을 입력해주세요."
                                                />
                                            </div>
                                        </div>

                                        {/* 규정 동의 */}
                                        <div className="pt-4 border-t border-slate-200">
                                            <label className="flex items-start space-x-3 cursor-pointer group bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                                                <input
                                                    type="checkbox" name="agreement" required aria-required="true"
                                                    checked={formData.agreement}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, agreement: e.target.checked }))}
                                                    className="mt-1 w-5 h-5 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="block text-sm font-bold text-slate-800 mb-1">
                                                        12. 랩실 활동 참여 및 운영 규정 확인 <span className="text-brand-accent">*</span>
                                                    </span>
                                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                        우리 랩실은 학기당 공모전 1회, 스터디 1회 참여가 필수이며 정기 모임(화요일 저녁)에 성실히 참여해야 합니다. 이를 확인하였으며 적극적으로 참여할 것을 동의합니다.
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* 개인정보 수집·이용 고지 및 동의 */}
                                        <div className="pt-4 border-t border-slate-200 space-y-4">
                                            {/* 접을 수 있는 고지 블록 */}
                                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                                                    aria-expanded={isPrivacyOpen}
                                                >
                                                    <span className="text-sm font-bold text-slate-800">개인정보 수집·이용 안내</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isPrivacyOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence initial={false}>
                                                    {isPrivacyOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-5 pb-5 pt-1 text-sm text-slate-600 font-medium leading-relaxed space-y-2 border-t border-slate-100">
                                                                <p className="pt-3"><span className="font-bold text-slate-800">수집 항목</span> — 이름, 학번, 학년, 학과, 전화번호, 지원서 기재 내용</p>
                                                                <p><span className="font-bold text-slate-800">수집 목적</span> — KBLs 신입 부원 모집 심사 및 합격 안내 연락</p>
                                                                <p><span className="font-bold text-slate-800">보유 기간</span> — 모집 절차 종료 후 6개월 이내 파기</p>
                                                                <p className="text-slate-500">
                                                                    귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다.
                                                                    다만 동의하지 않을 경우 지원서 접수가 불가능합니다.
                                                                </p>
                                                                <p className="pt-1">
                                                                    <Link
                                                                        to="/privacy"
                                                                        className="text-brand-accent font-bold hover:underline"
                                                                    >
                                                                        자세한 내용은 개인정보처리방침을 확인해 주세요
                                                                    </Link>
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* 필수 동의 체크박스 — 규정 확인과 별도 */}
                                            <label className={`flex items-start space-x-3 cursor-pointer group bg-slate-50 p-5 rounded-2xl border transition-colors ${privacyError ? 'border-red-300' : 'border-slate-100 hover:border-slate-300'}`}>
                                                <input
                                                    type="checkbox" name="privacyAgreement" required aria-required="true"
                                                    checked={formData.privacyAgreement}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, privacyAgreement: e.target.checked }));
                                                        if (e.target.checked) setPrivacyError(false);
                                                    }}
                                                    // required를 붙이면 네이티브 검증이 onSubmit보다 먼저 막아
                                                    // handleSubmit의 setPrivacyError가 실행되지 않는다. 그러면 기존
                                                    // 인라인 안내가 사라지고 브라우저 기본 말풍선만 뜬다.
                                                    // preventDefault로 말풍선을 막고 인라인 안내를 그대로 살린다.
                                                    onInvalid={(e) => {
                                                        e.preventDefault();
                                                        setPrivacyError(true);
                                                    }}
                                                    className="mt-1 w-5 h-5 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="block text-sm font-bold text-slate-800">
                                                        개인정보 수집·이용에 동의합니다 <span className="text-brand-accent">*</span>
                                                    </span>
                                                    {privacyError && (
                                                        <p className="text-sm text-red-500 font-medium mt-1" role="alert">
                                                            개인정보 수집·이용에 동의해야 지원서를 제출할 수 있습니다.
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-brand-accent hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base shadow-md transition-all flex items-center justify-center"
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> 지원서 제출 중...</>
                                                ) : "지원서 최종 제출하기"}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Contact Area (Forms layout matches perfectly with this block) */}
                                <div className="text-sm text-slate-600 font-medium space-y-3 leading-relaxed bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                                    <h3 className="font-bold text-slate-900 text-base mb-4">문의 연락처</h3>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[지도교수]</span>
                                        <span className="text-slate-800">이상곤 교수님</span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[임원진]</span>
                                        <span className="text-slate-800">김예진 회장 / 지근학 부회장</span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[이메일]</span>
                                        {/* 개인정보처리방침·푸터와 같은 대표 주소로 창구를 하나로 모은다.
                                            열람·정정·삭제 요구를 받을 창구가 갈리면 안 된다. */}
                                        <span className="text-slate-800"><a href="mailto:keybridgeleaders@gmail.com" className="text-brand-accent font-semibold hover:underline break-all">keybridgeleaders@gmail.com</a></span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[방문 문의]</span>
                                        <span className="text-slate-800">인문경영관 212호 KBLs 연구실</span>
                                    </p>
                                    <div className="pt-4 flex justify-end">
                                        <a href="/faq" className="inline-flex items-center text-brand-accent hover:text-brand-600 font-bold transition-colors group">
                                            자주 묻는 질문(FAQ) 확인하기 <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default Recruit;
