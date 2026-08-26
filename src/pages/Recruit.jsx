import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Button from '../components/Button';
import { ROUTE_META } from '../lib/routeMeta';
import {
    RECRUIT_SCHEDULE,
    getDocWindowPhase,
    getDaysUntilDocClose,
    getDocOpenLabel,
    getDocCloseLabel,
    getPostSubmitSteps,
} from '../lib/recruitSchedule';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CalendarClock, CalendarX2, CheckCircle2, ChevronDown, Loader2, Mail, Phone } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { ORG_INFO, getLeadsByTier } from '../lib/orgInfo';
// 모션 값은 src/lib/motion.js 단일 소스에서 온다.
import { tabPanel, ACCORDION_TRANSITION } from '../lib/motion';

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
    futurePlan: '하고 싶은 활동',
    agreement: '랩실 활동 참여 및 운영 규정 확인',
    privacyAgreement: '개인정보 수집·이용 동의',
};

// 서술형 4개 항목이 공유하는 입력 상한. 노션 rich_text 한 항목의 상한(2,000자)보다
// 크지만 api/submitNotion.js가 2,000자 단위로 나눠 담으므로 저장은 실패하지 않는다.
// 안내 문구와 실제 제한이 갈리지 않도록 값은 여기 한 곳에서만 정한다.
const TEXTAREA_MAX_LENGTH = 5000;

// 남은 글자수 안내 — 서술형 4곳이 같은 문구와 임계값을 써야 해서 한 곳에 둔다.
// 매 입력마다 값이 바뀌므로 aria-live는 붙이지 않는다(키 입력마다 읽어 주면 방해가 된다).
// 상한 자체는 textarea의 maxLength가 네이티브로 막는다.
// 색은 slate-500 — 이 저장소에서 slate-400은 어두운 배경과 아이콘 전용이고,
// 흰 배경 위 12px 본문으로 쓰면 대비 4.5:1에 못 미친다(Lighthouse color-contrast 실패).
// 바로 위 안내 문구 <p>와 같은 톤이기도 하다.
const RemainingChars = ({ value }) => {
    const remaining = TEXTAREA_MAX_LENGTH - value.length;
    return (
        <p className={`text-xs text-right tabular-nums ${remaining <= 100 ? 'text-brand-accent font-bold' : 'text-slate-500'}`}>
            {remaining.toLocaleString()}자 남음
        </p>
    );
};

/**
 * 개발 중 시계 주입 — /apply?tab=form&now=2026-09-10 처럼 붙이면
 * 시스템 시계를 건드리지 않고 접수 전/중/후 세 상태를 모두 확인할 수 있다.
 * 날짜만 주면 그날 KST 정오로 읽고, 형식이 틀리면 무시하고 실제 시각을 쓴다.
 *
 * import.meta.env.DEV 분기라 프로덕션 번들에는 남지 않는다 — 배포된 화면에서
 * 쿼리 하나로 접수 기간을 열 수 있으면 게이팅을 붙인 의미가 없다.
 * (어느 쪽이든 최종 방어선은 서버다 — api/submitNotion.js가 같은 기준으로 막는다.)
 */
function readInjectedNow(searchParams) {
    if (!import.meta.env.DEV) return undefined;
    const raw = searchParams.get('now');
    if (!raw) return undefined;
    const injected = new Date(raw.includes('T') ? raw : `${raw}T12:00:00+09:00`);
    return Number.isNaN(injected.getTime()) ? undefined : injected;
}

/**
 * 접수 기간 밖 안내 — 지원서 폼 자리를 대신한다.
 *
 * 기간 밖인데 폼을 열어두면 제출이 "완료"된 것처럼 보이고(서버는 거부한다),
 * 지원자는 자기 지원서가 접수됐다고 믿은 채 결과를 기다리게 된다.
 * 날짜·문의처는 recruitSchedule.js / orgInfo.js 단일 소스에서만 온다.
 */
const DocWindowNotice = ({ phase, onBackToInfo }) => {
    const isBefore = phase === 'before';
    return (
        <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm mb-12 p-8 md:p-12 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                {isBefore
                    ? <CalendarClock className="w-7 h-7 text-brand-600" aria-hidden="true" />
                    : <CalendarX2 className="w-7 h-7 text-slate-500" aria-hidden="true" />}
            </div>
            <h2 className="text-subhead font-bold text-slate-900 mb-3 break-keep">
                {isBefore
                    ? `서류 접수는 ${getDocOpenLabel()}부터 시작됩니다`
                    : '이번 학기 접수가 마감되었습니다'}
            </h2>
            <p className="text-copy text-slate-600 font-medium break-keep max-w-md mx-auto">
                {isBefore
                    ? `접수 기간은 ${getDocOpenLabel()}~${getDocCloseLabel()}입니다. 기간이 시작되면 이 자리에서 바로 지원서를 작성하실 수 있습니다.`
                    : `${RECRUIT_SCHEDULE.semesterLabel} 모집의 서류 접수는 ${getDocCloseLabel()}에 마감되어 더 이상 지원서를 받지 않습니다. 다음 모집 일정은 확정되는 대로 공지합니다.`}
            </p>
            <p className="text-sm text-slate-500 font-medium mt-6 break-keep">
                문의 <a href={`mailto:${ORG_INFO.email}`} className="text-brand-accent font-bold hover:underline break-all">{ORG_INFO.email}</a>
            </p>
            <div className="pt-8">
                <Button size="lg" variant="secondary" className="w-full" onClick={onBackToInfo}>
                    모집 정보 다시 보기
                </Button>
            </div>
        </div>
    );
};

/**
 * 접수 완료 화면 — 제출에 성공하면 폼 자리를 대체한다.
 *
 * 예전에는 alert 한 줄 뒤 모집 정보 탭으로 돌려보냈다. 확인을 누르는 순간
 * "접수됐다"는 증거도, "이제 무엇을 기다리면 되는지"도 화면에 남지 않았다.
 * 그래서 남는 화면으로 바꾸고 다음 일정·연락 방법·문의처를 함께 둔다.
 * 일정은 RECRUIT_SCHEDULE.steps에서 접수 이후 단계만 가져오므로
 * 전형 일정을 고치면 이 화면도 함께 따라온다.
 */
const ApplyReceipt = ({ onBackToInfo }) => {
    // 폼이 사라지고 다른 화면이 들어선 것을 스크린리더에도 알린다.
    // 마운트 시점 1회뿐 — 이 컴포넌트는 제출에 성공해야 마운트된다.
    const headingRef = useRef(null);
    useEffect(() => {
        headingRef.current?.focus({ preventScroll: true });
    }, []);

    return (
        <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm mb-12 p-8 md:p-12">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                    <CheckCircle2 className="w-8 h-8 text-brand-accent" aria-hidden="true" />
                </div>
                <h2 ref={headingRef} tabIndex={-1} className="text-subhead font-bold text-slate-900 mb-3 break-keep focus-ring">
                    지원서 접수가 완료되었습니다
                </h2>
                <p className="text-copy text-slate-600 font-medium break-keep max-w-md mx-auto">
                    {RECRUIT_SCHEDULE.semesterLabel} KBLs 신입 회원 모집에 지원해 주셔서 감사합니다.
                    작성하신 지원서는 정상적으로 접수되었습니다.
                </p>
            </div>

            {/* 다음 일정 — 접수 이후 단계만. 값은 recruitSchedule.js 단일 소스 */}
            <section className="mt-10">
                <h3 className="font-bold text-base text-slate-800 mb-4 border-b border-slate-200 pb-2">다음 일정</h3>
                <ul className="space-y-3">
                    {getPostSubmitSteps().map((step) => (
                        <li key={step.title} className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                            <span className="font-bold text-slate-900">{step.title}</span>
                            {/* 타임라인과 같은 표기 규칙 — year가 null이면 날짜만 */}
                            <span className="text-sm font-bold text-brand-600 tracking-wide whitespace-nowrap">
                                {RECRUIT_SCHEDULE.year ? `${RECRUIT_SCHEDULE.year}. ${step.date}` : step.date}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="mt-8 space-y-4 text-copy text-slate-700 font-medium">
                <p className="flex items-start gap-3 break-keep">
                    <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span>
                        전형 결과와 인터뷰 안내는 <span className="font-bold text-slate-900">기재하신 전화번호로 개별 연락</span>드립니다.
                        연락처를 잘못 적으셨다면 아래 이메일로 알려주세요.
                    </span>
                </p>
                <p className="flex items-start gap-3 break-keep">
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span>
                        문의 <a href={`mailto:${ORG_INFO.email}`} className="text-brand-accent font-bold hover:underline break-all">{ORG_INFO.email}</a>
                    </span>
                </p>
            </div>

            <div className="pt-8">
                <Button size="lg" variant="secondary" className="w-full" onClick={onBackToInfo}>
                    모집 정보 다시 보기
                </Button>
            </div>
        </div>
    );
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
        experience: '',
        futurePlan: '',
        agreement: false,
        privacyAgreement: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 개인정보 고지 블록 접힘 상태와 미동의 제출 시 인라인 안내
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [privacyError, setPrivacyError] = useState(false);

    // 제출 결과. alert 대신 화면에 남는다 — 성공은 폼 자리를 대체하는 접수 완료
    // 화면으로, 실패는 제출 버튼 위 인라인 블록으로 보여준다.
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(null); // { message, fields: string[] }
    // 서버가 "기간 밖"이라고 답한 경우(작성 중 마감 등) 화면 판정을 서버 쪽에 맞춘다.
    // 브라우저 시계는 리렌더 없이 흐르므로 화면 판정만으로는 이 순간을 잡을 수 없다.
    const [serverWindowPhase, setServerWindowPhase] = useState(null);

    // 제출 성공(접수 완료 화면)과 기간 밖 거부(안내 화면)는 긴 폼이 짧은 화면으로
    // 갈리는 순간이다. 상태 변경과 같은 틱에 부른 smooth 스크롤은 문서 높이가
    // 무너지며 취소돼 시점이 바닥에 남는다(오너 리포트 2026-08-27) — 그래서
    // 렌더가 끝난 뒤 즉시 스크롤로 옮긴다. 탭 전환은 URL(search)이 바뀌어
    // ScrollToTop이 받지만, 이 두 경우는 URL이 그대로라 여기서 처리해야 한다.
    useEffect(() => {
        if (isSubmitted || serverWindowPhase) window.scrollTo(0, 0);
    }, [isSubmitted, serverWindowPhase]);

    // 접수 기간 판정 — 사실은 recruitSchedule.js 단일 소스에서만 온다.
    const injectedNow = readInjectedNow(searchParams);
    const docPhase = serverWindowPhase ?? getDocWindowPhase(injectedNow);
    const daysLeft = getDaysUntilDocClose(injectedNow);
    // 개발 중 접수 완료 화면 확인용(?submitted=1) — 프로덕션 번들에는 남지 않는다.
    const showReceipt = isSubmitted || (import.meta.env.DEV && searchParams.get('submitted') === '1');

    const goToInfoTab = () => {
        setActiveTab("info");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

        setSubmitError(null);
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
                // 폼 자리를 접수 완료 화면으로 바꾼다. 탭을 옮기지 않는 이유 —
                // 모집 정보로 돌려보내면 "접수됐다"는 증거가 화면에 남지 않는다.
                setIsSubmitted(true);
                setFormData({
                    name: '', studentId: '', grade: '', major: '', phone: '',
                    tools: [], motivation: '', interest: '', experience: '', futurePlan: '',
                    agreement: false, privacyAgreement: false
                });
                // 스크롤 복귀는 isSubmitted 이펙트가 렌더 후에 처리한다(위 주석 참조)
            } else {
                // 서버 응답 원문은 콘솔에만 남긴다. 화면에 JSON을 그대로 띄우면
                // 내부 구조가 드러나고, 사용자는 무엇을 고쳐야 할지 알 수 없다.
                console.error('지원서 제출 실패:', response.status, data);

                // 접수 기간 밖이라 거부된 경우 — 항목 안내가 아니라 기간 안내를
                // 보여줘야 한다. 폼을 열어둔 채 마감을 넘긴 지원자가 여기로 온다.
                if (data?.reason === 'doc-window') {
                    // 스크롤 복귀는 serverWindowPhase 이펙트가 렌더 후에 처리한다
                    setServerWindowPhase(data.phase === 'before' ? 'before' : 'after');
                    return;
                }

                // 서버가 비어 있는 항목을 알려주면 화면 라벨로 바꿔 안내한다.
                const missing = Array.isArray(data.missingFields)
                    ? data.missingFields.map((f) => FIELD_LABELS[f] || f)
                    : [];
                setSubmitError({
                    message: missing.length > 0
                        ? '다음 항목을 확인해 주세요.'
                        : '지원서를 제출하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.',
                    fields: missing,
                });
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setSubmitError({ message: '서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', fields: [] });
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
                    {/* 자격 문구는 ORG_INFO.eligibility 단일 소스 — FAQ 답변과 같은 값을 읽는다.
                        원래 문구 '(학사 신입/재학생)'을 되살리지 않은 이유: 휴학생을 배제하는
                        것처럼 읽히는데 폼의 학년 선택지에는 '휴학중'이 있어 실제와 어긋났다. */}
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4 break-keep">
                        {RECRUIT_SCHEDULE.semesterLabel} KBLs 신입 회원 모집<br />
                        <span className="text-lg md:text-2xl text-slate-500 font-bold block mt-3">{ORG_INFO.eligibility.short}</span>
                    </h1>
                    <p className="text-base text-slate-600 font-medium mt-6 break-keep">
                        "스스로 문제를 정의하고 해결하고 싶다면, KBLs와 함께하세요."
                    </p>
                </header>

                {/* 2. Tab Navigation (탭 메뉴 - Sticky, Left Aligned) */}
                {/* z-30: 페이지 sticky는 전역 오버레이(z-40)·GNB(z-50)보다 아래 —
                    GNB.jsx의 층 규약 참고. z-40이면 모바일 메뉴가 탭바에 뚫린다. */}
                <div className="sticky top-[80px] bg-slate-50 z-30 flex border-b border-slate-200 mb-10 pt-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`pb-4 font-bold text-lg transition-colors press focus-ring relative ${activeTab === "info" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
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
                            className={`pb-4 font-bold text-lg transition-colors press focus-ring relative ${activeTab === "form" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
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
                    {/* custom={activeTab}은 소비하는 variants가 없는 데드 코드라 제거.
                        패널 전환 값은 motion.js tabPanel 단일 소스. */}
                    <AnimatePresence mode="wait">
                        {activeTab === "info" ? (
                            <motion.div
                                key="info"
                                {...tabPanel(-1)}
                                className="w-full space-y-14 pb-12"
                            >
                                {/* 모집 대상 + 정기 활동 시간 — 활동 조건 선공개.
                                    기수제 조직은 자기선별 정확도가 지원자 수보다 중요하다.
                                    시간 값은 FAQ '정기 회의 및 주요 활동 시간' 답변에서 가져왔다
                                    (새 값을 만들지 않는다). */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
                                    <section>
                                        <h2 className="text-subhead font-bold text-slate-900 mb-5 tracking-tight">모집 대상</h2>
                                        <ul className="list-disc pl-6 space-y-3 text-slate-700 font-medium text-copy">
                                            <li>데이터 분석 실전 적용 희망자</li>
                                            <li>공모전 완주 목표자</li>
                                            <li>책임감 있게 팀 활동이 가능한 분</li>
                                        </ul>
                                    </section>
                                    <section>
                                        <h2 className="text-subhead font-bold text-slate-900 mb-5 tracking-tight">정기 활동 시간</h2>
                                        <ul className="list-disc pl-6 space-y-3 text-slate-700 font-medium text-copy">
                                            <li>정기 회의 — 매주 {ORG_INFO.meeting.day} {ORG_INFO.meeting.time}</li>
                                            <li>스터디·공모전 팀 회의 — 팀원 일정에 맞춰 자율 진행</li>
                                        </ul>
                                    </section>
                                </div>

                                {/* 핵심 혜택 */}
                                <section>
                                    <h2 className="text-subhead font-bold text-slate-900 mb-6 tracking-tight">KBLs만의 핵심 혜택</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { emoji: "✨", text: "유료 생성형 AI 서비스 지원" },
                                            { emoji: "🏢", text: `${ORG_INFO.location.room} 전용 학습 공간 제공` },
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
                                    <h2 className="text-subhead font-bold text-slate-900 mb-8 tracking-tight">상세 모집 일정</h2>
                                    <div className="relative pl-7 border-l-2 border-slate-200 space-y-10 ml-2">
                                        {RECRUIT_SCHEDULE.steps.map((step, i) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[35px] top-1.5 w-4 h-4 bg-slate-400 rounded-full ring-4 ring-slate-50 relative z-10" />
                                                {/* year는 옵셔널 — 확정 전(null)에는 기존과 동일하게 날짜만 표시 */}
                                                <div className="text-base font-bold text-brand-600 mb-1 tracking-wide">
                                                    {RECRUIT_SCHEDULE.year ? `${RECRUIT_SCHEDULE.year}. ${step.date}` : step.date}
                                                </div>
                                                <div className="font-extrabold text-lg text-slate-900">{step.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Rules & Duties (아코디언) */}
                                <section>
                                    <h2 className="text-subhead font-bold text-slate-900 mb-3 tracking-tight">Rules & Duties</h2>
                                    {/* 핵심 의무 한 줄은 아코디언 밖에 상시 노출한다.
                                        조건 공개는 지원자를 줄이는 대신 완주율을 올린다. */}
                                    <p className="text-copy text-slate-700 font-medium mb-5 break-keep">
                                        모든 회원은 <span className="font-bold text-slate-900">학기당 공모전 1회·스터디 1회 참여가 필수</span>이며, {ORG_INFO.meeting.day} 정기 모임에 참여합니다.
                                    </p>
                                    <div className="space-y-4">
                                        {[
                                            { title: "활동 의무", content: `학기당 공모전/스터디 1회 필수, ${ORG_INFO.meeting.day} 정기 모임` },
                                            {
                                                // 경고 사유는 ORG_INFO.warning이 단일 소스 — FAQ 답변과 같은 문장이어야 한다
                                                title: "경고 규정", content: (
                                                    <div className="space-y-4">
                                                        <p className="font-bold text-slate-800">다음의 경우 {ORG_INFO.warning.method}</p>
                                                        <ul className="list-inside list-disc pl-2 space-y-2 text-slate-600">
                                                            {ORG_INFO.warning.reasons.map((reason) => (
                                                                <li key={reason}>{reason}</li>
                                                            ))}
                                                        </ul>
                                                        <p className="pt-2 text-sm text-slate-500">상세 내용이 궁금하시면 문의 부탁드립니다.</p>
                                                    </div>
                                                )
                                            }
                                        ].map((rule, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
                                                <button
                                                    onClick={() => toggleAccordion(i)}
                                                    aria-expanded={openAccordion === i}
                                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 text-base hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-inset"
                                                >
                                                    {rule.title}
                                                    <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-200 ${openAccordion === i ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openAccordion === i && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={ACCORDION_TRANSITION}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-6 pt-0 text-slate-600 font-medium text-copy bg-white border-t border-slate-50">
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
                                    {/* apply_cta_click은 붙이지 않는다 — 이미 /apply 안이고,
                                        탭 전환은 apply_form_tab_view가 별도로 잡는다. */}
                                    <Button
                                        size="lg"
                                        className="w-full"
                                        onClick={() => {
                                            setActiveTab("form");
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        지원하기
                                    </Button>
                                </div>
                            </motion.div>

                        ) : (

                            <motion.div
                                key="form"
                                {...tabPanel(1)}
                                className="w-full flex flex-col pb-20"
                            >
                                {/* 폼 자리에는 셋 중 하나만 온다 — 접수 완료 화면 > 기간 안내 > 지원서 폼.
                                    기간 판정은 recruitSchedule.js 단일 소스이고, 서버(api/submitNotion.js)도
                                    같은 값으로 막는다. 화면만 막으면 우회할 수 있기 때문. */}
                                {showReceipt ? (
                                    <ApplyReceipt onBackToInfo={goToInfoTab} />
                                ) : docPhase !== "open" ? (
                                    <DocWindowNotice phase={docPhase} onBackToInfo={goToInfoTab} />
                                ) : (
                                    <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-sm mb-12 p-8 md:p-12">
                                        <div className="mb-10 text-center">
                                            <h2 className="text-subhead font-bold text-slate-900 mb-3">{RECRUIT_SCHEDULE.semesterLabel} KBLs 지원서</h2>
                                            {/* 마감일과 남은 일수 — recruitSchedule.js docWindow에서 파생한다.
                                                이 블록은 접수 중에만 렌더되므로 daysLeft는 항상 0 이상이다. */}
                                            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 mb-3 text-sm font-bold text-brand-700">
                                                <CalendarClock className="w-4 h-4" aria-hidden="true" />
                                                서류 마감 {getDocCloseLabel()} ({daysLeft > 0 ? `D-${daysLeft}` : 'D-day'})
                                            </p>
                                            <p className="text-slate-500 font-medium">아래 항목을 꼼꼼히 작성한 후 제출해주세요.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
                                            {/* 기본 인적 사항 */}
                                            <div className="space-y-6 bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl">
                                                <h3 className="font-bold text-base text-slate-800 mb-4 border-b border-slate-200 pb-2">기본 인적사항</h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label htmlFor="apply-name" className="block text-sm font-bold text-slate-700">1. 이름 <span className="text-brand-accent">*</span></label>
                                                        <input
                                                            id="apply-name"
                                                            type="text" name="name" required
                                                            value={formData.name} onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                            placeholder="홍길동"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor="apply-studentId" className="block text-sm font-bold text-slate-700">2. 학번 <span className="text-brand-accent">*</span></label>
                                                        {/* type="number"는 휠·스피너로 값이 바뀌고 앞자리 0이 잘리거나 지수 표기가
                                                            끼어들 수 있다. 학번은 계산하는 수가 아니라 숫자로 된 식별자이므로 text로
                                                            두고 숫자 키패드만 띄운다. 서버는 그대로 Number(studentId)로 저장한다. */}
                                                        <input
                                                            id="apply-studentId"
                                                            type="text" inputMode="numeric" pattern="[0-9]+" name="studentId" required
                                                            value={formData.studentId} onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                            placeholder="202612345"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label htmlFor="apply-grade" className="block text-sm font-bold text-slate-700">3. 학년 <span className="text-brand-accent">*</span></label>
                                                        <select
                                                            id="apply-grade"
                                                            name="grade" required
                                                            value={formData.grade} onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium appearance-none"
                                                        >
                                                            <option value="" disabled>학년을 선택해주세요</option>
                                                            {/* ★ 이 라벨이 그대로 노션 '학년' select에 저장되는 값이다.
                                                                바꾸거나 추가할 때는 반드시 노션 옵션을 먼저 고칠 것 —
                                                                코드가 앞서면 노션에 옵션이 자동 생성되어 과거 지원자
                                                                데이터와 갈라진다(운영 가이드 '손대면 안 되는 것').

                                                                선택지는 지원 자격(ORG_INFO.eligibility)과 정확히 맞아야
                                                                한다. 2026-08-25에 대학원생·졸업생을 넣었다가 되돌렸다 —
                                                                자격 판단이 전공·학년 축과 신분 축을 섞어 내려진 탓이었다.
                                                                대상은 학부 재학생·휴학생이므로 '휴학중'까지가 전부다.
                                                                노션에는 그때 추가한 두 옵션이 남아 있지만 폼에서 고를 수
                                                                없으니 무해하다 — 옵션을 지우면 그 값을 가진 행의 데이터가
                                                                날아가므로 접수 기간에 스키마를 되돌리지 않는다. */}
                                                            {['1학년', '2학년', '3학년', '4학년', '5학년', '휴학중'].map(g => (
                                                                <option key={g} value={g}>{g}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor="apply-major" className="block text-sm font-bold text-slate-700">4. 학과(전공) <span className="text-brand-accent">*</span></label>
                                                        <input
                                                            id="apply-major"
                                                            type="text" name="major" required
                                                            value={formData.major} onChange={handleInputChange}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                            placeholder="컴퓨터공학부"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="apply-phone" className="block text-sm font-bold text-slate-700">5. 전화번호 <span className="text-brand-accent">*</span></label>
                                                    <input
                                                        id="apply-phone"
                                                        type="tel" name="phone" required
                                                        value={formData.phone} onChange={handleInputChange}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                                        placeholder="01012345678"
                                                    />
                                                </div>
                                            </div>

                                            {/* 역량 확인 */}
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    {/* 항목 이름이 개별 체크박스가 아니라 묶음 전체를 가리킨다. for 대상이 없는
                                                        <label>은 어디에도 연결되지 않으므로 role="group" + aria-labelledby로 묶는다. */}
                                                    <span id="apply-tools-label" className="block text-sm font-bold text-slate-700">6. 사용 가능한 툴 <span className="text-slate-500 font-medium">(선택)</span></span>
                                                    <p id="apply-tools-hint" className="text-xs text-slate-500 mb-2">본인이 다룰 줄 알거나 경험해본 툴을 모두 선택해주세요.</p>
                                                    <div
                                                        role="group"
                                                        aria-labelledby="apply-tools-label"
                                                        aria-describedby="apply-tools-hint"
                                                        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                                                    >
                                                        {['Excel', 'Python', 'R', 'Notion', 'Figma', '기타(커서 등)', '없음(배워보고싶음)'].map((tool) => (
                                                            // min-h-11 = 44px. 라벨 전체가 터치 타깃이므로 높이는 라벨에서 확보하고,
                                                            // shrink-0으로 좁은 화면에서도 컨트롤이 20px 아래로 찌그러지지 않게 한다.
                                                            <label key={tool} className="flex items-center space-x-2 cursor-pointer group min-h-11">
                                                                <input
                                                                    type="checkbox" value={tool}
                                                                    checked={formData.tools.includes(tool)}
                                                                    onChange={handleCheckboxChange}
                                                                    className="w-5 h-5 shrink-0 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
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
                                                    <label htmlFor="apply-motivation" className="block text-sm font-bold text-slate-700">7. 지원 동기 · 목적 <span className="text-brand-accent">*</span></label>
                                                    <p id="apply-motivation-hint" className="text-xs text-slate-500 mb-2">KBLs에 지원하게 된 계기와 이를 통해 이루고자 하는 개인적인 목표를 서술해주세요.</p>
                                                    <textarea
                                                        id="apply-motivation"
                                                        aria-describedby="apply-motivation-hint"
                                                        maxLength={TEXTAREA_MAX_LENGTH}
                                                        name="motivation" required rows={4}
                                                        value={formData.motivation} onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                        placeholder="내용을 입력해주세요."
                                                    />
                                                    <RemainingChars value={formData.motivation} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="apply-interest" className="block text-sm font-bold text-slate-700">8. 관심 분야 · 관심 직무 <span className="text-brand-accent">*</span></label>
                                                    <p id="apply-interest-hint" className="text-xs text-slate-500 mb-2">데이터 분석, 개발, 디자인, 기획 등 평소 관심 있는 분야나 희망 직무를 알려주세요.</p>
                                                    <textarea
                                                        id="apply-interest"
                                                        aria-describedby="apply-interest-hint"
                                                        maxLength={TEXTAREA_MAX_LENGTH}
                                                        name="interest" required rows={3}
                                                        value={formData.interest} onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                        placeholder="내용을 입력해주세요."
                                                    />
                                                    <RemainingChars value={formData.interest} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="apply-experience" className="block text-sm font-bold text-slate-700">9. 공모전·프로젝트 경험 <span className="text-brand-accent">*</span></label>
                                                    <p id="apply-experience-hint" className="text-xs text-slate-500 mb-2">과거 진행했던 팀 프로젝트나 교내외 공모전 경험이 있다면 자유롭게 서술해주세요. (없으면 '없음'으로 기재)</p>
                                                    <textarea
                                                        id="apply-experience"
                                                        aria-describedby="apply-experience-hint"
                                                        maxLength={TEXTAREA_MAX_LENGTH}
                                                        name="experience" required rows={4}
                                                        value={formData.experience} onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                        placeholder="내용을 입력해주세요."
                                                    />
                                                    <RemainingChars value={formData.experience} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="apply-futurePlan" className="block text-sm font-bold text-slate-700">10. 하고 싶은 활동 <span className="text-brand-accent">*</span></label>
                                                    <p id="apply-futurePlan-hint" className="text-xs text-slate-500 mb-2">KBLs 합격 시 가장 주도적으로 참여해보고 싶은 스터디나 프로젝트 아이디어를 적어주세요.</p>
                                                    <textarea
                                                        id="apply-futurePlan"
                                                        aria-describedby="apply-futurePlan-hint"
                                                        maxLength={TEXTAREA_MAX_LENGTH}
                                                        name="futurePlan" required rows={3}
                                                        value={formData.futurePlan} onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                        placeholder="내용을 입력해주세요."
                                                    />
                                                    <RemainingChars value={formData.futurePlan} />
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
                                                            11. 랩실 활동 참여 및 운영 규정 확인 <span className="text-brand-accent">*</span>
                                                        </span>
                                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                            우리 랩실은 학기당 공모전 1회, 스터디 1회 참여가 필수이며 정기 모임({ORG_INFO.meeting.day} 저녁)에 성실히 참여해야 합니다. 이를 확인하였으며 적극적으로 참여할 것을 동의합니다.
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
                                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-inset"
                                                        aria-expanded={isPrivacyOpen}
                                                    >
                                                        <span className="text-sm font-bold text-slate-800">개인정보 수집·이용 안내</span>
                                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isPrivacyOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence initial={false}>
                                                        {isPrivacyOpen && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={ACCORDION_TRANSITION}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-5 pb-5 pt-1 text-sm text-slate-600 font-medium leading-relaxed space-y-2 border-t border-slate-100">
                                                                    <p className="pt-3"><span className="font-bold text-slate-800">수집 항목</span> — 이름, 학번, 학년, 학과, 전화번호, 지원서 기재 내용</p>
                                                                    <p><span className="font-bold text-slate-800">수집 목적</span> — KBLs 신입 회원 모집 심사 및 합격 안내 연락</p>
                                                                    {/* 방침(Privacy.jsx) 3항의 예외를 요약에도 반영 — 간이 고지와
                                                                        방침이 다르면 안 된다. */}
                                                                    <p><span className="font-bold text-slate-800">보유 기간</span> — 모집 절차 종료 후 6개월 이내 파기 (선발된 부원은 활동 기간 동안 보관 후 파기)</p>
                                                                    <p className="text-slate-500">
                                                                        귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다.
                                                                        다만 동의하지 않을 경우 지원서 접수가 불가능합니다.
                                                                    </p>
                                                                    <p className="pt-1">
                                                                        {/* 폼 안에서만 새 탭으로 연다 — SPA 내 이동이면 뒤로가기 복귀 시
                                                                            작성 중이던 폼 값이 전부 사라지기 때문(QA #2).
                                                                            sessionStorage 저장은 방침에 없는 처리라 쓰지 않는다.
                                                                            푸터 등 폼 밖 방침 링크는 기존대로 SPA Link 유지. */}
                                                                        <a
                                                                            href="/privacy"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            aria-label="개인정보처리방침 자세히 보기 (새 탭에서 열림)"
                                                                            className="text-brand-accent font-bold hover:underline"
                                                                        >
                                                                            자세한 내용은 개인정보처리방침을 확인해 주세요 ↗
                                                                        </a>
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

                                            {/* 제출 실패 안내 — alert를 대신한다. 제출 버튼 바로 위라
                                                방금 누른 자리에서 그대로 읽히고, 화면에 남아 다시 확인할 수 있다. */}
                                            {submitError && (
                                                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
                                                    <p className="flex items-start gap-2 text-sm font-bold text-red-700 break-keep">
                                                        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                                        <span>{submitError.message}</span>
                                                    </p>
                                                    {submitError.fields.length > 0 && (
                                                        <ul className="mt-2 pl-7 list-disc space-y-1 text-sm font-medium text-red-700">
                                                            {submitError.fields.map((field) => (
                                                                <li key={field}>{field}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full py-4 bg-brand-accent hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base shadow-md transition-all press focus-ring flex items-center justify-center"
                                                >
                                                    {isSubmitting ? (
                                                        <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> 지원서 제출 중...</>
                                                    ) : "지원서 최종 제출하기"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Contact Area (Forms layout matches perfectly with this block) */}
                                <div className="text-sm text-slate-600 font-medium space-y-3 leading-relaxed bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                                    <h3 className="font-bold text-slate-900 text-base mb-4">문의 연락처</h3>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[지도교수]</span>
                                        <span className="text-slate-800">{ORG_INFO.professor.name} 교수님</span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[임원진]</span>
                                        {/* 문의 창구는 운영 총괄(랩실장·부랩실장)이다. leads[0]·[1]로
                                            집던 것을 tier로 바꿨다 — 명단 순서가 바뀌어도 기능별
                                            임원이 문의처로 잘못 올라오지 않는다. */}
                                        <span className="text-slate-800">
                                            {getLeadsByTier('lead').map((lead) => `${lead.name} ${lead.role}`).join(' / ')}
                                        </span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[이메일]</span>
                                        {/* 개인정보처리방침·푸터와 같은 대표 주소로 창구를 하나로 모은다.
                                            열람·정정·삭제 요구를 받을 창구가 갈리면 안 된다. */}
                                        <span className="text-slate-800"><a href={`mailto:${ORG_INFO.email}`} className="text-brand-accent font-semibold hover:underline break-all">{ORG_INFO.email}</a></span>
                                    </p>
                                    <p className="flex flex-col sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                                        <span className="w-24 text-slate-500 font-bold mb-1 sm:mb-0">[방문 문의]</span>
                                        <span className="text-slate-800">{ORG_INFO.location.room} KBLs 연구실</span>
                                    </p>
                                    <div className="pt-4 flex justify-end">
                                        {/* 폼 탭 안의 링크는 새 탭으로 연다 — SPA 밖으로 전체 리로드되어 나갔다가
                                            돌아오면 작성 중이던 지원서가 통째로 사라진다(위 개인정보처리방침 링크와 같은 이유). */}
                                        <a
                                            href="/faq"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="자주 묻는 질문(FAQ) 확인하기 (새 탭에서 열림)"
                                            className="inline-flex items-center text-brand-accent hover:text-brand-600 font-bold transition-colors group"
                                        >
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
