import React from 'react';
import { RotateCw } from 'lucide-react';

/**
 * 노션 데이터를 못 불러왔거나 결과가 비었을 때 보여주는 안내 블록.
 *
 * 에러/빈 상태 마크업이 페이지마다 조금씩 다르게 복제돼 있던 것을 한 곳으로 모았다.
 * onRetry를 넘기면 '다시 시도' 버튼이 붙는다. 빈 상태처럼 재시도가 의미 없는
 * 경우에는 넘기지 않으면 된다.
 *
 * @param {string} title        굵은 한 줄 안내
 * @param {string} [description] 보조 설명
 * @param {() => void} [onRetry] 다시 시도 핸들러
 * @param {string} [className]   배경·모서리 등 페이지별 톤 조정
 */
const DataNotice = ({ title, description, onRetry, className = '' }) => (
    <div className={`w-full py-20 flex flex-col items-center justify-center text-center px-6 ${className}`}>
        <span className="text-lg font-medium text-slate-600">{title}</span>
        {description && <span className="text-sm text-slate-500 mt-2">{description}</span>}
        {onRetry && (
            <button
                type="button"
                onClick={onRetry}
                className="mt-6 inline-flex items-center justify-center min-h-11 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
                <RotateCw className="w-4 h-4 mr-2" />
                다시 시도
            </button>
        )}
    </div>
);

export default DataNotice;
