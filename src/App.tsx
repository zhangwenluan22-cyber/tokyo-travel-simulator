import { useEffect, useMemo, useState } from 'react';
import { buildUIImageSources, OptimizedImage, SceneImage } from './components/SceneImage';
import { initialStats, lunchHubSceneId, lunchSpotSceneIds, scenes, tokyoHubSceneId, tokyoSpotSceneIds } from './data/gameData';
import type { Choice, Gender, Scene, SelectedChoiceResult, Stats } from './types/game';

type AppScreen = 'landing' | 'gender' | 'game';

const initialChoiceResult: SelectedChoiceResult | null = null;

interface PendingChoiceSnapshot {
  stats: Stats;
  lastChoiceId?: string;
}

interface EndingTag {
  label: string;
  value: string;
}

interface EndingReport {
  title: string;
  shortComment: string;
  summary: string;
  tags: EndingTag[];
}

function clampStat(value: number) {
  return Math.max(-999, Math.min(999, value));
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

const statLabelMap: Record<keyof Stats, string> = {
  money: '预算',
  energy: '体力',
  happiness: '快乐',
  luck: '运气',
};

function getSceneImagePath(baseName: string | undefined, gender: Gender | null) {
  if (!baseName || !gender) {
    return null;
  }

  const suffix = gender === 'female' ? '女' : '男';
  return `/images/optimized/scenes/${baseName}_${suffix}.webp`;
}

function getSceneFallbackPath(baseName: string | undefined, gender: Gender | null) {
  if (!baseName || !gender) {
    return null;
  }

  const suffix = gender === 'female' ? '女' : '男';
  return `/images/scenes/${baseName}_${suffix}.png`;
}

function collectPreloadSceneIds(scene: Scene, choices: Choice[]) {
  if (scene.type === 'hub') {
    return choices
      .map((choice) => choice.nextSceneId)
      .filter((sceneId): sceneId is string => Boolean(sceneId));
  }

  if (scene.type === 'narrative' && scene.nextSceneId) {
    return [scene.nextSceneId];
  }

  if (scene.type === 'choice' || scene.type === 'random') {
    return (scene.choices ?? [])
      .map((choice) => choice.nextSceneId)
      .filter((sceneId): sceneId is string => Boolean(sceneId));
  }

  return [];
}

function renderChoiceText(text: string) {
  const slashIndex = text.indexOf('／');

  if (slashIndex === -1) {
    return <span className="choice-text-main">{text}</span>;
  }

  const primary = text.slice(0, slashIndex).trim();
  const secondary = text.slice(slashIndex + 1).trim();

  return (
    <>
      <span className="choice-text-main">{primary}</span>
      <span className="choice-text-secondary">{secondary}</span>
    </>
  );
}

function buildEndingReport(params: {
  money: number;
  energy: number;
  happiness: number;
  luck: number;
  tokyoVisitedCount: number;
  lunchVisitedCount: number;
}): EndingReport {
  const { money, energy, happiness, luck, tokyoVisitedCount, lunchVisitedCount } = params;

  let title = '东京自由行新人';
  if (luck >= 10 && happiness >= 75) {
    title = '好运加持旅行者';
  } else if (money > 85 && happiness >= 60) {
    title = '钱包守护成功';
  } else if (energy < 40 && happiness >= 80) {
    title = '体力燃尽但快乐拉满';
  } else if (energy < 45 && luck < 0) {
    title = '靠意志力通关东京';
  } else if (tokyoVisitedCount >= 4 && lunchVisitedCount >= 3) {
    title = '东京暴走体验派';
  } else if (money >= 55 && money <= 85 && happiness >= 60) {
    title = '理智旅行家';
  } else if (lunchVisitedCount <= 1 && energy < 60) {
    title = '便利店治愈派';
  }

  let shortComment = '这趟东京一日游有顺有乱，但整体还算稳。';
  if (title === '好运加持旅行者') {
    shortComment = '今天像是偷偷抽到了隐藏顺风局。';
  } else if (title === '钱包守护成功') {
    shortComment = '玩到了，也没让钱包原地阵亡。';
  } else if (title === '体力燃尽但快乐拉满') {
    shortComment = '人快没电了，但快乐值明显超标。';
  } else if (title === '靠意志力通关东京') {
    shortComment = '运气不算帮忙，但你硬是把东京扛下来了。';
  } else if (title === '东京暴走体验派') {
    shortComment = '该逛的逛了，该吃的也没少吃，行程相当有冲劲。';
  } else if (title === '理智旅行家') {
    shortComment = '节奏没失控，花销也在线，是一趟相当真实的自由行。';
  } else if (title === '便利店治愈派') {
    shortComment = '累归累，但总能找到最适合自己的补给方式。';
  }

  const budgetTag =
    money > 85 ? '稳' : money >= 55 ? '正常' : money >= 25 ? '偏高' : '危险';
  const energyTag =
    energy >= 85 ? '充沛' : energy >= 60 ? '还行' : energy >= 35 ? '微累' : '见底';
  const happinessTag =
    happiness >= 90 ? '拉满' : happiness >= 75 ? '很高' : happiness >= 60 ? '不错' : '一般';
  const luckTag =
    luck >= 10 ? '爆棚' : luck >= 5 ? '不错' : luck >= 0 ? '普通' : '有点背';

  let summary = '你认真体验了这趟东京的一部分热闹，也留下了属于自己的节奏。';
  if (tokyoVisitedCount >= 3 && lunchVisitedCount >= 2) {
    summary =
      '你认真逛了几个最想去的地方，也吃到了不少想吃的东西。虽然中途多少有点累，但节奏没有彻底失控，这趟东京小冒险已经很像一次真实自由行。';
  } else if (tokyoVisitedCount >= 2) {
    summary =
      '你顺利踩到了几个想去的地点，旅途中虽然有些手忙脚乱，但整体还算稳。回头看，这是一趟带点慌张感、也带点满足感的东京一日游。';
  } else if (lunchVisitedCount >= 3) {
    summary =
      '这趟旅行在美食线上的发挥格外亮眼，胃容量已经明显尽力。就算没把所有地点都跑完，你也用自己的方式认真享受了东京。';
  } else if (energy < 40) {
    summary =
      '东京的节奏确实不轻松，你几乎是靠一点点执念把行程撑到了最后。虽然很累，但能顺利收尾，本身就已经算完成了一次漂亮通关。';
  } else {
    summary =
      '你没有把东京塞成满满当当的任务清单，而是走出了属于自己的步调。也许不算完美，但这份带着真实感的小混乱，反而更像一次真的旅行。';
  }

  return {
    title,
    shortComment,
    summary,
    tags: [
      { label: '预算控制', value: budgetTag },
      { label: '体力状态', value: energyTag },
      { label: '快乐指数', value: happinessTag },
      { label: '运气', value: luckTag },
      { label: '东京探索', value: `${tokyoVisitedCount}/4` },
      { label: '午餐挑战', value: `${lunchVisitedCount}/4` },
    ],
  };
}

function resolveArrivalFeedback(lastChoiceId?: string): SelectedChoiceResult {
  const boughtInsurance = lastChoiceId === 'buy_insurance';

  return {
    sceneId: 'arrival_airport',
    choiceId: boughtInsurance ? 'arrival_with_insurance' : 'arrival_without_insurance',
    text: boughtInsurance ? '查看保险信息并登记损坏' : '先去向机场工作人员申报',
    feedback: boughtInsurance
      ? '你立刻去找机场工作人员登记行李损坏，又翻出之前买好的保险信息。虽然心情还是有点崩，但至少后续赔付有了着落。'
      : '你站在行李转盘旁边陷入沉思，不过还是先去找工作人员申报损坏，至少别错过时限。',
    learningTip: boughtInsurance
      ? '行李损坏后，最好尽快向航空公司或地勤柜台申报，并保留行李牌、照片、损坏证明等材料。'
      : '没买旅游保险时，也可以先向航空公司或机场工作人员申报行李损坏，后续赔付通常取决于航空公司规则和申报时限。',
    nextSceneId: scenes.arrival_airport.nextSceneId,
  };
}

function resolveHubChoices(visitedTokyoSpots: string[]): Choice[] {
  const visitedSet = new Set(visitedTokyoSpots);

  const destinationChoices: Choice[] = [
    { id: 'go_ueno', text: visitedSet.has('ueno_zoo') ? '上野动物园（已去过）' : '上野动物园', nextSceneId: 'ueno_zoo', isNavigation: true },
    { id: 'go_akiba', text: visitedSet.has('akihabara') ? '秋叶原（已去过）' : '秋叶原', nextSceneId: 'akihabara', isNavigation: true },
    { id: 'go_shibuya', text: visitedSet.has('shibuya_harajuku') ? '涉谷、原宿（已去过）' : '涉谷、原宿', nextSceneId: 'shibuya_harajuku', isNavigation: true },
    { id: 'go_ginza', text: visitedSet.has('ginza') ? '银座（已去过）' : '银座', nextSceneId: 'ginza', isNavigation: true },
  ];

  const availableChoices = destinationChoices.filter((choice) => !visitedSet.has(choice.nextSceneId ?? ''));

  if (visitedSet.size === 0) {
    return availableChoices;
  }

  return [
    ...availableChoices,
    {
      id: 'go_lunch',
      text: visitedSet.size === tokyoSpotSceneIds.length ? '差不多都玩到了，去吃午餐' : '差不多了，去吃午餐',
      nextSceneId: 'lunch',
      isNavigation: true,
    },
  ];
}

function resolveLunchChoices(visitedLunchSpots: string[]): Choice[] {
  const visitedSet = new Set(visitedLunchSpots);

  const restaurantChoices: Choice[] = [
    { id: 'go_ramen', text: '拉面店', nextSceneId: 'ramen', isNavigation: true },
    { id: 'go_soba', text: '荞麦面店', nextSceneId: 'soba', isNavigation: true },
    { id: 'go_sushi', text: '回转寿司', nextSceneId: 'sushi', isNavigation: true },
    { id: 'go_tonkatsu', text: '炸猪排店', nextSceneId: 'tonkatsu', isNavigation: true },
  ];

  const availableChoices = restaurantChoices.filter((choice) => !visitedSet.has(choice.nextSceneId ?? ''));

  if (visitedSet.size === 0) {
    return availableChoices;
  }

  return [
    ...availableChoices,
    {
      id: 'go_cafe',
      text: visitedSet.size === lunchSpotSceneIds.length ? '吃得差不多了，去咖啡厅' : '吃饱了，去咖啡厅',
      nextSceneId: 'cafe',
      isNavigation: true,
    },
  ];
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [gender, setGender] = useState<Gender | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState('departure');
  const [stats, setStats] = useState<Stats>(initialStats);
  const [selectedChoice, setSelectedChoice] = useState<SelectedChoiceResult | null>(initialChoiceResult);
  const [visitedTokyoSpots, setVisitedTokyoSpots] = useState<string[]>([]);
  const [visitedLunchSpots, setVisitedLunchSpots] = useState<string[]>([]);
  const [lastChoiceId, setLastChoiceId] = useState<string | undefined>(undefined);
  const [pendingChoiceSnapshot, setPendingChoiceSnapshot] = useState<PendingChoiceSnapshot | null>(null);

  const currentScene = scenes[currentSceneId];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, currentSceneId]);

  const activeChoices = useMemo(() => {
    if (currentScene.type === 'hub') {
      if (currentScene.id === lunchHubSceneId) {
        return resolveLunchChoices(visitedLunchSpots);
      }

      return resolveHubChoices(visitedTokyoSpots);
    }

    return currentScene.choices ?? [];
  }, [currentScene, visitedLunchSpots, visitedTokyoSpots]);

  useEffect(() => {
    if (screen !== 'game' || !gender) {
      return;
    }

    const preloadSceneIds = collectPreloadSceneIds(currentScene, activeChoices);
    const preloadPaths = Array.from(
      new Set(
        preloadSceneIds.flatMap((sceneId) => {
          const scene = scenes[sceneId];
          const optimizedPath = getSceneImagePath(scene?.imageBaseName, gender);
          const fallbackPath = getSceneFallbackPath(scene?.imageBaseName, gender);
          return [optimizedPath, fallbackPath].filter((path): path is string => Boolean(path));
        }),
      ),
    );

    preloadPaths.forEach((path) => {
      const image = new Image();
      image.src = path;
    });
  }, [activeChoices, currentScene, gender, screen]);

  const continueButtonLabel = useMemo(() => {
    if (currentScene.type === 'narrative' || currentScene.type === 'random') {
      return '继续';
    }

    return '前往下一幕';
  }, [currentScene.type]);

  const canRetryChoice = useMemo(() => {
    return currentScene.type === 'choice' && selectedChoice !== null && pendingChoiceSnapshot !== null;
  }, [currentScene.type, selectedChoice, pendingChoiceSnapshot]);

  const hubTip = useMemo(() => {
    if (currentScene.id === tokyoHubSceneId) {
      if (visitedTokyoSpots.length === tokyoSpotSceneIds.length) {
        return '差不多把想去的地方都逛到了。接下来要不要先去吃午餐？';
      }

      if (visitedTokyoSpots.length > 0) {
        return `已打卡 ${visitedTokyoSpots.length}/${tokyoSpotSceneIds.length}。东京太大了，越逛越想去更多地方。挑下一个心动地点继续走吧。`;
      }

      return '东京太大了，选择困难又开始发作。先挑一个最想去的地方吧，逛完再决定下一站。';
    }

    if (currentScene.id === lunchHubSceneId) {
      if (visitedLunchSpots.length === lunchSpotSceneIds.length) {
        return '该吃的几样都吃得差不多了。要不要收手，去咖啡厅坐坐？';
      }

      if (visitedLunchSpots.length > 0) {
        return `已打卡 ${visitedLunchSpots.length}/${lunchSpotSceneIds.length}。东京美食太多了，胃容量却有限。还想再挑战一家，还是准备去咖啡厅歇一会儿？`;
      }

      return '东京美食太多了，胃容量却有限。先选一家最想吃的吧，吃完再决定还要不要继续挑战。';
    }

    return '';
  }, [currentScene.id, visitedLunchSpots, visitedTokyoSpots]);

  const endingSummary = useMemo(() => {
    if (currentScene.id !== 'ending') {
      return null;
    }

    return buildEndingReport({
      money: stats.money,
      energy: stats.energy,
      happiness: stats.happiness,
      luck: stats.luck,
      tokyoVisitedCount: visitedTokyoSpots.length,
      lunchVisitedCount: visitedLunchSpots.length,
    });
  }, [currentScene.id, stats.energy, stats.happiness, stats.luck, stats.money, visitedLunchSpots.length, visitedTokyoSpots.length]);

  const startGame = () => {
    setScreen('gender');
  };

  const handleGenderPick = (nextGender: Gender) => {
    setGender(nextGender);
    setCurrentSceneId('departure');
    setStats(initialStats);
    setSelectedChoice(null);
    setVisitedTokyoSpots([]);
    setVisitedLunchSpots([]);
    setLastChoiceId(undefined);
    setPendingChoiceSnapshot(null);
    setScreen('game');
  };

  const applyEffects = (effects?: Choice['effects']) => {
    if (!effects) {
      return;
    }

    setStats((prev) => ({
      money: clampStat(prev.money + (effects.money ?? 0)),
      energy: clampStat(prev.energy + (effects.energy ?? 0)),
      happiness: clampStat(prev.happiness + (effects.happiness ?? 0)),
      luck: clampStat(prev.luck + (effects.luck ?? 0)),
    }));
  };

  const handleChoiceClick = (choice: Choice) => {
    if (choice.isNavigation && choice.nextSceneId) {
      setCurrentSceneId(choice.nextSceneId);
      setSelectedChoice(null);
      setPendingChoiceSnapshot(null);
      return;
    }

    setPendingChoiceSnapshot({
      stats: { ...stats },
      lastChoiceId,
    });
    applyEffects(choice.effects);
    setLastChoiceId(choice.id);
    setSelectedChoice({
      sceneId: currentScene.id,
      choiceId: choice.id,
      text: choice.text,
      translation: choice.translation,
      feedback: choice.feedback,
      learningTip: choice.learningTip,
      isCorrect: choice.isCorrect,
      nextSceneId: choice.nextSceneId,
    });
  };

  const handleNarrativeContinue = () => {
    const result = resolveArrivalFeedback(lastChoiceId);
    setSelectedChoice(result);
  };

  const handleRandomSceneAction = () => {
    const pool = currentScene.choices ?? [];

    if (pool.length === 0) {
      return;
    }

    const randomChoice = pool[Math.floor(Math.random() * pool.length)];
    applyEffects(randomChoice.effects);
    setPendingChoiceSnapshot(null);
    setSelectedChoice({
      sceneId: currentScene.id,
      choiceId: randomChoice.id,
      text: randomChoice.text,
      translation: randomChoice.translation,
      feedback: randomChoice.feedback,
      learningTip: randomChoice.learningTip,
      isCorrect: randomChoice.isCorrect,
      nextSceneId: randomChoice.nextSceneId,
    });
  };

  const handleContinue = () => {
    if (!selectedChoice?.nextSceneId) {
      return;
    }

    if (selectedChoice.sceneId !== tokyoHubSceneId && tokyoSpotSceneIds.includes(selectedChoice.sceneId as (typeof tokyoSpotSceneIds)[number])) {
      setVisitedTokyoSpots((prev) =>
        prev.includes(selectedChoice.sceneId) ? prev : [...prev, selectedChoice.sceneId],
      );
    }

    if (selectedChoice.sceneId !== lunchHubSceneId && lunchSpotSceneIds.includes(selectedChoice.sceneId as (typeof lunchSpotSceneIds)[number])) {
      setVisitedLunchSpots((prev) =>
        prev.includes(selectedChoice.sceneId) ? prev : [...prev, selectedChoice.sceneId],
      );
    }

    setCurrentSceneId(selectedChoice.nextSceneId);
    setSelectedChoice(null);
    setPendingChoiceSnapshot(null);
  };

  const handleRetryChoice = () => {
    if (!pendingChoiceSnapshot) {
      return;
    }

    setStats(pendingChoiceSnapshot.stats);
    setLastChoiceId(pendingChoiceSnapshot.lastChoiceId);
    setSelectedChoice(null);
    setPendingChoiceSnapshot(null);
  };

  const restart = () => {
    setScreen('landing');
    setGender(null);
    setCurrentSceneId('departure');
    setStats(initialStats);
    setSelectedChoice(null);
    setVisitedTokyoSpots([]);
    setVisitedLunchSpots([]);
    setLastChoiceId(undefined);
    setPendingChoiceSnapshot(null);
  };

  if (screen === 'landing') {
    return (
      <main className="app-shell">
        <section className="phone-frame start-screen">
          <h1>日本旅游模拟器</h1>
          <p className="lead">
            一次轻松又有点手忙脚乱的东京旅行。边做选择，边学一点旅行日语。
          </p>
          <div className="landing-cover">
            <img
              src="/images/scenes/东京旅行模拟器海报.png"
              alt="东京旅行模拟器封面海报"
              className="landing-cover__img"
            />
          </div>
          <button className="primary-button" onClick={startGame}>
            开始旅行
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'gender') {
    return (
      <main className="app-shell">
        <section className="phone-frame">
          <div className="eyebrow">第一步</div>
          <h2>选择角色</h2>
          <p className="section-copy">先选一个旅行版本。后续场景会根据对应角色自动切换。</p>
          <div className="gender-grid">
            <button className="gender-card" onClick={() => handleGenderPick('female')}>
              <OptimizedImage
                optimizedSrc={buildUIImageSources('女生').optimizedSrc}
                fallbackSrc={buildUIImageSources('女生').fallbackSrc}
                alt="女生版"
              />
            </button>
            <button className="gender-card" onClick={() => handleGenderPick('male')}>
              <OptimizedImage
                optimizedSrc={buildUIImageSources('男生').optimizedSrc}
                fallbackSrc={buildUIImageSources('男生').fallbackSrc}
                alt="男生版"
              />
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <header className="game-header">
          <div>
            <div className="eyebrow">东京之旅</div>
            <h2>{currentScene.title}</h2>
          </div>
          <button className="ghost-button" onClick={restart}>
            重新开始
          </button>
        </header>

        <div className="stats-panel">
          {Object.entries(stats).map(([key, value]) => (
            <div className="stat-chip" key={key}>
              <span>{statLabelMap[key as keyof Stats]}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <section className="scene-card">
          <p className="scene-description">{currentScene.description}</p>
          {hubTip ? <p className="hub-tip">{hubTip}</p> : null}
        </section>

        <SceneImage baseName={currentScene.imageBaseName} gender={gender ?? undefined} alt={currentScene.title} />

        {currentScene.type === 'ending' ? (
          <section className="result-card ending-card">
            <div className="ending-title-group">
              <div className="ending-kicker">结局称号</div>
              <h3>{endingSummary?.title}</h3>
              <p className="ending-short-comment">{endingSummary?.shortComment}</p>
            </div>
            <div className="ending-tags">
              {endingSummary?.tags.map((tag) => (
                <div className="ending-tag-card" key={tag.label}>
                  <span>{tag.label}</span>
                  <strong>{tag.value}</strong>
                </div>
              ))}
            </div>
            <div className="ending-summary-block">
              <h4>旅行总结</h4>
              <p>{endingSummary?.summary}</p>
            </div>
            <button className="primary-button" onClick={restart}>
              再玩一次
            </button>
          </section>
        ) : null}

        {currentScene.type === 'narrative' && !selectedChoice ? (
          <button className="primary-button" onClick={handleNarrativeContinue}>
            继续
          </button>
        ) : null}

        {currentScene.type === 'random' && !selectedChoice ? (
          <button className="primary-button" onClick={handleRandomSceneAction}>
            {currentScene.actionText ?? '开始'}
          </button>
        ) : null}

        {currentScene.type !== 'narrative' &&
        currentScene.type !== 'random' &&
        currentScene.type !== 'ending' &&
        !selectedChoice ? (
          <section className="choices-list">
            {activeChoices.map((choice) => (
              <button key={choice.id} className="choice-button" onClick={() => handleChoiceClick(choice)}>
                {renderChoiceText(choice.text)}
              </button>
            ))}
          </section>
        ) : null}

        {selectedChoice ? (
          <section className="result-card">
            <p className="picked-choice">{selectedChoice.text}</p>
            {typeof selectedChoice.isCorrect === 'boolean' ? (
              <p className={selectedChoice.isCorrect ? 'result-badge result-badge--correct' : 'result-badge result-badge--wrong'}>
                {selectedChoice.isCorrect ? '回答正确' : '这次选错了'}
              </p>
            ) : null}
            {selectedChoice.translation ? (
              <div className="result-block result-block--translation">
                <h4>翻译</h4>
                <p>{selectedChoice.translation}</p>
              </div>
            ) : null}
            {selectedChoice.feedback ? (
              <div className="result-block result-block--feedback">
                <p>{selectedChoice.feedback}</p>
              </div>
            ) : null}
            {selectedChoice.learningTip ? (
              <div className="result-block result-block--tip">
                <h4>学习点</h4>
                <p>{selectedChoice.learningTip}</p>
              </div>
            ) : null}
            {currentScene.type !== 'narrative' && currentScene.id !== 'lunch' ? (
              <div className="effects-row">
                {Object.entries(
                  (currentScene.choices?.find((choice) => choice.id === selectedChoice.choiceId)?.effects ?? {}),
                ).map(([key, value]) =>
                  typeof value === 'number' ? (
                    <span key={key} className="effect-chip">
                      {statLabelMap[key as keyof Stats]} {formatDelta(value)}
                    </span>
                  ) : null,
                )}
              </div>
            ) : null}
            {selectedChoice.nextSceneId ? (
              <div className="result-actions">
                {canRetryChoice ? (
                  <button className="secondary-button" onClick={handleRetryChoice}>
                    返回重选
                  </button>
                ) : null}
                <button className="primary-button" onClick={handleContinue}>
                  {continueButtonLabel}
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}

export default App;
