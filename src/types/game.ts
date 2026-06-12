export type Gender = 'female' | 'male';

export type SceneType = 'choice' | 'narrative' | 'hub' | 'random' | 'ending';

export type StatKey = 'money' | 'energy' | 'happiness' | 'luck';

export interface Effects {
  money?: number;
  energy?: number;
  happiness?: number;
  luck?: number;
}

export interface Choice {
  id: string;
  text: string;
  nextSceneId?: string;
  isNavigation?: boolean;
  translation?: string;
  feedback?: string;
  learningTip?: string;
  isCorrect?: boolean;
  effects?: Effects;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  type: SceneType;
  imageBaseName?: string;
  choices?: Choice[];
  nextSceneId?: string;
  actionText?: string;
}

export interface Stats {
  money: number;
  energy: number;
  happiness: number;
  luck: number;
}

export interface SelectedChoiceResult {
  sceneId: string;
  choiceId: string;
  text: string;
  translation?: string;
  feedback?: string;
  learningTip?: string;
  isCorrect?: boolean;
  nextSceneId?: string;
}
