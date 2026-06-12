import { useMemo, useState } from 'react';
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

export function SceneImage({ baseName, gender, alt }: SceneImageProps) {
  const [hidden, setHidden] = useState(false);

  const imagePath = useMemo(() => {
    if (!baseName || !gender) {
      return null;
    }

    return `/images/scenes/${baseName}_${suffixMap[gender]}.png`;
  }, [baseName, gender]);

  if (!imagePath || hidden) {
    return (
      <div className="scene-image scene-image--placeholder">
        <span>插画待补充</span>
      </div>
    );
  }

  return (
    <div className="scene-image">
      <img src={imagePath} alt={alt} onError={() => setHidden(true)} />
    </div>
  );
}
