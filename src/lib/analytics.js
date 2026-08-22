/**
 * GA4 연동 모듈.
 *
 * index.html에 스크립트를 박지 않고 여기서 동적으로 주입한다.
 * 측정 ID가 없으면(로컬 개발 등) 아무 동작도 하지 않고 경고만 한 번 남긴다.
 *
 * SPA라 자동 page_view는 최초 1회만 잡히므로 config에서 꺼두고,
 * 라우트 변경마다 AnalyticsTracker가 trackPageView를 직접 호출한다.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let hasWarned = false;
let isInitialized = false;

/** 측정 ID가 없을 때의 경고. 호출 지점이 여럿이라 전역으로 1회만 출력한다. */
function warnOnce() {
    if (hasWarned) return;
    hasWarned = true;
    console.warn(
        '[analytics] VITE_GA_MEASUREMENT_ID가 없어 GA4를 비활성화했습니다. ' +
        '수집이 필요하면 .env에 측정 ID를 설정하세요.'
    );
}

/** GA4가 활성 상태인지 여부 */
export function isAnalyticsEnabled() {
    return Boolean(MEASUREMENT_ID);
}

/** gtag.js를 주입하고 초기화한다. 여러 번 호출해도 한 번만 실행된다. */
export function initAnalytics() {
    if (!MEASUREMENT_ID) {
        warnOnce();
        return;
    }
    if (isInitialized) return;
    isInitialized = true;

    window.dataLayer = window.dataLayer || [];
    // gtag는 arguments 객체를 그대로 밀어넣어야 해서 화살표 함수를 쓸 수 없다.
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    gtag('js', new Date());
    // 라우트 변경마다 수동으로 보내므로 자동 전송은 끈다
    gtag('config', MEASUREMENT_ID, { send_page_view: false });
}

/** 라우트 변경 시 page_view 전송 */
export function trackPageView(path, title) {
    if (!MEASUREMENT_ID) {
        warnOnce();
        return;
    }
    window.gtag?.('event', 'page_view', {
        page_path: path,
        page_location: window.location.href,
        page_title: title ?? document.title,
    });
}

/** 커스텀 이벤트 전송 */
export function trackEvent(name, params = {}) {
    if (!MEASUREMENT_ID) {
        warnOnce();
        return;
    }
    window.gtag?.('event', name, params);
}
