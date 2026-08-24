import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 사이트 공용 CTA 버튼.
 *
 * 5곳에 제각각이던 버튼 클래스를 하나로 모은다. radius는 rounded-full 하나,
 * hover는 브랜드 토큰(brand-accent-hover)만 쓴다.
 *
 * variant는 2개로 고정한다 — 늘리지 말 것.
 *  - primary   : 주 행동. brand-accent filled + 흰 텍스트
 *  - secondary : 보조 행동. outlined, 낮은 강조
 *
 * size
 *  - md : GNB 등 좁은 영역용 (min-h-11로 터치 타깃 보장)
 *  - lg : 본문·폼 CTA용
 *
 * `to`를 주면 react-router Link로, 없으면 button으로 렌더된다.
 */
const VARIANT_CLASSES = {
    primary:
        'bg-brand-accent hover:bg-brand-accent-hover text-white shadow-md hover:shadow-lg',
    secondary:
        'bg-white/70 border border-slate-300 text-slate-700 hover:border-brand-accent hover:text-brand-accent',
};

const SIZE_CLASSES = {
    md: 'min-h-11 px-5 py-2.5 text-sm font-semibold',
    lg: 'px-8 py-4 text-lg font-bold',
};

const Button = ({ variant = 'primary', size = 'lg', to, className = '', children, ...rest }) => {
    const classes = [
        'inline-flex items-center justify-center rounded-full transition-all',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
    ].join(' ');

    if (to) {
        return (
            <Link to={to} className={classes} {...rest}>
                {children}
            </Link>
        );
    }
    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
};

export default Button;
