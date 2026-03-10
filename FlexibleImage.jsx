import { useState, useEffect } from 'react';

export default function FlexibleImage({ baseSrc, alt, className }) {
  // 혹시 경로에 실수로 확장자가 적혀있다면 알아서 깔끔하게 제거해 주는 똑똑한 로직!
  const cleanPath = baseSrc.replace(/\.(jpg|png|jpeg)$/i, '');

  const [imgSrc, setImgSrc] = useState(`${cleanPath}.jpg`);
  const [hasTriedPng, setHasTriedPng] = useState(false);

  // baseSrc가 바뀔 때마다 초기화
  useEffect(() => {
    setImgSrc(`${cleanPath}.jpg`);
    setHasTriedPng(false);
  }, [cleanPath]);

  const handleError = () => {
    // jpg 로딩에 실패했고, 아직 png를 시도해보지 않았다면? png로 변경!
    if (!hasTriedPng) {
      setImgSrc(`${cleanPath}.png`);
      setHasTriedPng(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}