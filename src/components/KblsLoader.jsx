import React from 'react';

const KblsLoader = () => {
  return (
    // min-h-svh: 폴백이 뷰포트를 채워 Footer를 접힘 아래로 밀어둔다.
    // 라우트 청크가 마운트될 때 뷰포트 안 요소가 밀리지 않아 CLS 0이 유지된다.
    // (h-64였을 때는 첫 페인트에 보이던 Footer가 본문 삽입으로 밀려 CLS 0.69 발생)
    <div className="flex justify-center items-center min-h-svh w-full">
      <div className="flex items-end space-x-2 h-24">
        {/* 첫 번째 막대 (진한 파란색) */}
        <div className="w-4 h-12 bg-blue-700 rounded-full animate-equalizer" style={{ animationDelay: '0ms' }}></div>
        
        {/* 두 번째 막대 (파란색) */}
        <div className="w-4 h-20 bg-blue-500 rounded-full animate-equalizer" style={{ animationDelay: '200ms' }}></div>
        
        {/* 세 번째 막대 - 가장 김 (진한 청록색) */}
        <div className="w-4 h-24 bg-teal-600 rounded-full animate-equalizer" style={{ animationDelay: '400ms' }}></div>
        
        {/* 네 번째 막대 (밝은 청록색) */}
        <div className="w-4 h-20 bg-teal-400 rounded-full animate-equalizer" style={{ animationDelay: '200ms' }}></div>
        
        {/* 다섯 번째 막대 (에메랄드색) */}
        <div className="w-4 h-12 bg-emerald-400 rounded-full animate-equalizer" style={{ animationDelay: '0ms' }}></div>
      </div>
    </div>
  );
};

export default KblsLoader;