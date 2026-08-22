/**
 * WebP를 우선 제공하고 JPEG로 폴백하는 이미지 컴포넌트.
 *
 * baseSrc는 확장자 없는 경로를 받는다. (예: "/image/team")
 * width/height는 실제 파일의 원본 크기를 넘겨 레이아웃 밀림(CLS)을 막는다.
 *
 * <picture>에 display:contents(=`contents`)를 주어 레이아웃 상자를 만들지 않게 한다.
 * 이게 없으면 부모의 aspect 컨테이너와 img의 h-full 사이에 상자가 끼어들어 높이가 깨진다.
 */
export default function FlexibleImage({
    baseSrc,
    alt,
    className,
    width,
    height,
    loading = 'lazy',
}) {
    // 호출부에서 실수로 확장자를 붙여도 안전하게 제거
    const path = baseSrc.replace(/\.(jpe?g|png|webp)$/i, '');

    return (
        <picture className="contents">
            <source srcSet={`${path}.webp`} type="image/webp" />
            <img
                src={`${path}.jpg`}
                alt={alt}
                className={className}
                width={width}
                height={height}
                loading={loading}
                decoding="async"
            />
        </picture>
    );
}
