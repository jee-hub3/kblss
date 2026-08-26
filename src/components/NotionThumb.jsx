import { useEffect, useState } from 'react';

/**
 * 노션 썸네일 — 자리를 먼저 잡고, 도착하면 부드럽게 채운다.
 *
 * 왜 전용 컴포넌트인가 —
 * 노션 썸네일은 우리 CDN이 아니라 us-west-2(오리건) S3에서 서명 URL로 직접 온다.
 * 그 URL은 1시간 만료이고 조회할 때마다 서명이 바뀌어(실측 확인) 브라우저·CDN
 * 캐시가 매번 빗나간다. 즉 "느리게 도착하는 것"을 없앨 수는 없고, 전제로 두고
 * 그려야 한다. 회색 자리를 먼저 깔고 로드 완료 시 페이드인하면 이미지가 튀듯
 * 나타나는 '끊김'이 사라진다.
 *
 * 크기가 이미 충분히 작다면 페이드는 눈에 띄지 않고, 느릴수록 값을 한다.
 * (원본 용량 자체는 노션에 올리는 파일을 줄여야 해결된다 — 이 컴포넌트의 몫이 아니다.)
 *
 * 실패(만료·404)해도 회색 바닥이 남아 깨진 이미지 아이콘이 보이지 않는다.
 *
 * priority: 첫 화면에 보이는 이미지에만 준다. lazy를 풀고 우선순위를 올린다 —
 *   목록 전체에 주면 화면 밖 이미지까지 경쟁해 오히려 느려진다.
 */
export default function NotionThumb({
    src,
    alt = '',
    className = '',
    imgClassName = '',
    priority = false,
}) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    // 같은 자리에서 src가 갈릴 수 있다(필터·페이지 전환) — 상태를 되돌리지 않으면
    // 새 이미지가 도착하기도 전에 이미 보이는 것으로 취급된다.
    useEffect(() => {
        setLoaded(false);
        setFailed(false);
    }, [src]);

    return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
            {src && !failed && (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
                />
            )}
        </div>
    );
}
