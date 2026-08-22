import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../lib/analytics';

/**
 * 라우트 변경마다 GA4 page_view를 보낸다.
 *
 * BrowserRouter 안에 두어야 useLocation이 동작한다.
 * 초기화 effect가 먼저 선언돼 있어 최초 page_view보다 항상 앞서 실행된다.
 */
const AnalyticsTracker = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        initAnalytics();
    }, []);

    useEffect(() => {
        trackPageView(`${pathname}${search}`);
    }, [pathname, search]);

    return null;
};

export default AnalyticsTracker;
