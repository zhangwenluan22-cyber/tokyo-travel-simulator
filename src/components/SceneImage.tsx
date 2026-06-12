import { useEffect, useMemo, useState } from 'react';
import type { Gender } from '../types/game';

interface SceneImageProps {
  baseName?: string;
  gender?: Gender;
  alt: string;
}

const suffixMap: Record<Gender, string> = {
  female: '女',
  male: '男',
};

function buildSceneSources(baseName?: string, gender?: Gender) {
  if (!baseName || !gender) {
    return null;
  }

  const suffix = suffixMap[gender];
  return {
    optimizedSrc: `/images/optimized/scenes/${baseName}_${suffix}.webp`,
    fallbackSrc: `/images/scenes/${baseName}_${suffix}.png`,
  };
}

export function buildUIImageSources(fileName: string) {
  return {
    optimizedSrc: `/images/optimized/ui/${fileName}.webp`,
    fallbackSrc: `/images/ui/${fileName}.png`,
  };
}

interface OptimizedImageProps {
  optimizedSrc: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export function OptimizedImage({
  optimizedSrc,
  fallbackSrc,
  alt,
  className,
}: OptimizedImageProps) {
  const [src, setSrc] = useState(optimizedSrc);

  useEffect(() => {
    setSrc(optimizedSrc);
  }, [optimizedSrc]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}

export function SceneImage({ baseName, gender, alt }: SceneImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const imageSources = useMemo(() => buildSceneSources(baseName, gender), [baseName, gender]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(imageSources?.optimizedSrc ?? null);
  }, [imageSources]);

  if (!imageSources) {
    return (
      <div className="scene-image scene-image--placeholder">
        <span>插画待补充</span>
      </div>
    );
  }

  return (
    <div className="scene-image">
      {!isLoaded && !hasError ? (
        <div className="scene-image__placeholder">
          <div className="scene-image__skeleton" />
          <span>图片加载中……</span>
        </div>
      ) : null}

      {hasError ? (
        <div className="scene-image__placeholder scene-image__placeholder--fallback">
          <span>插画待补充</span>
        </div>
      ) : (
        <img
          key={currentSrc ?? imageSources.fallbackSrc}
          src={currentSrc ?? imageSources.fallbackSrc}
          alt={alt}
          className={isLoaded ? 'scene-image__img is-loaded' : 'scene-image__img'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (currentSrc && currentSrc !== imageSources.fallbackSrc) {
              setCurrentSrc(imageSources.fallbackSrc);
              setIsLoaded(false);
              return;
            }

            setHasError(true);
            setIsLoaded(false);
          }}
        />
      )}
    </div>
  );
}
