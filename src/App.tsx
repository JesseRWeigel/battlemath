import React, {
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import confetti from 'canvas-confetti';
import { reducer, initialState, TYPES, getStreakMilestone } from './AppReducer';
import { useMsgAfterSubmit } from './hooks';
import HeroSvg from './components/HeroSvg';
import Tutorial from './components/Tutorial';
import { getTranslations, Locale } from './i18n';
import NumberPad from './components/NumberPad';
import LevelSelect from './components/LevelSelect';
import { Level } from './levels';
import musicAddition from './assets/music/music_addition.mp3';
import musicSubtraction from './assets/music/music_subtraction.mp3';
import musicMultiplication from './assets/music/music_multiplication.mp3';
import musicDivision from './assets/music/music_division.mp3';
import BackgroundSound from './components/BackgroundSound';
import { generateHint } from './utils/HintGenerator';
import {
  playCorrectSound,
  playIncorrectSound,
  playEnemyDefeatSound,
  playVictoryFanfare,
  playStreakMilestoneSound,
  playStarEarnedSound,
} from './utils/SoundEffects';
import {
  generateDailyProblems,
  getTodayKey,
  saveDailyResult,
} from './utils/DailyChallenge';

// Character sprite imports
import heroIdle from './assets/images/characters/hero_idle.png';
import heroAttack from './assets/images/characters/hero_attack.png';
import heroVictory from './assets/images/characters/hero_victory.png';
import heroHurt from './assets/images/characters/hero_hurt.png';

// Background imports
import bgAddition from './assets/images/backgrounds/bg_addition.jpg';
import bgSubtraction from './assets/images/backgrounds/bg_subtraction.jpg';
import bgMultiplication from './assets/images/backgrounds/bg_multiplication.jpg';
import bgDivision from './assets/images/backgrounds/bg_division.jpg';

// Enemy sprite imports
import enemyAddition from './assets/images/characters/enemy_addition.png';
import enemySubtraction from './assets/images/characters/enemy_subtraction.png';
import enemyMultiplication from './assets/images/characters/enemy_multiplication.png';
import enemyDivision from './assets/images/characters/enemy_division.png';

const musicTracks: Record<string, string> = {
  addition: musicAddition,
  subtraction: musicSubtraction,
  multiplication: musicMultiplication,
  division: musicDivision,
};

// Character sprites
const heroImages = {
  idle: heroIdle,
  attack: heroAttack,
  victory: heroVictory,
  hurt: heroHurt,
};

const bgImages: Record<string, string> = {
  addition: bgAddition,
  subtraction: bgSubtraction,
  multiplication: bgMultiplication,
  division: bgDivision,
};

// Preload all backgrounds on page load so switching is instant
Object.values(bgImages).forEach((src) => {
  const img = new window.Image();
  img.src = src;
});

const enemyImages: Record<string, any> = {
  addition: enemyAddition,
  subtraction: enemySubtraction,
  multiplication: enemyMultiplication,
  division: enemyDivision,
};

function displayOperator(op: string): string {
  switch (op) {
    case '+':
      return '+';
    case '-':
      return '\u2212';
    case '*':
      return '\u00D7';
    case '/':
      return '\u00F7';
    default:
      return op;
  }
}

const OPERATIONS = [
  { label: '+', value: 'addition' },
  { label: '\u2212', value: 'subtraction' },
  { label: '\u00D7', value: 'multiplication' },
  { label: '\u00F7', value: 'division' },
];
// DIFFICULTIES moved inside component for i18n
// MODE_TYPES moved inside component for i18n

function SegmentedButtonGroup({
  options,
  selectedValue,
  onSelect,
  accessibilityLabel,
  testID,
}: {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  accessibilityLabel: string;
  testID?: string;
}) {
  return (
    <View
      style={styles.segmentedGroup}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      nativeID={testID}
    >
      {options.map((option) => {
        const isActive = option.value === selectedValue;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segmentedButton,
              isActive && styles.segmentedButtonActive,
            ]}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
          >
            <Text style={styles.segmentedButtonText}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function App() {
  const [
    {
      answer,
      numOfEnemies,
      val1,
      val2,
      won,
      operator,
      mode,
      difficulty,
      modeType,
      previousNumOfEnemies,
      isStoredState,
      soundEnabled,
      highContrast,
      score,
      questionStartTime,
      bestScore,
      lastPointsEarned,
      hintLevel,
      attempts,
      streak,
      maxStreak,
      streakBonus,
      showTutorial,
      hasSeenTutorial,
      totalAttempts,
      correctAttempts,
      totalAnswerTime,
      starsEarned,
      answerMode,
      choices,
      currentLevel,
      levelProgress,
      gameScreen,
      locale,
      isDailyChallenge,
      isBossLevel,
      bossHP,
      bossMaxHP,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const t = getTranslations(locale);
  const DIFFICULTIES = [
    { label: t.easy, value: 'easy' },
    { label: t.medium, value: 'medium' },
    { label: t.hard, value: 'hard' },
  ];
  const MODE_TYPES = [
    { label: t.whole, value: 'wholeNumber' },
    { label: t.decimal, value: 'decimal' },
    { label: t.negative, value: 'negative' },
  ];
  const [streakLabel, setStreakLabel] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showPoints, setShowPoints] = useState(false);
  const pointsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shaking, setShaking] = useState(false);
  const [defeatingEnemy, setDefeatingEnemy] = useState(false);
  const [heroAnim, setHeroAnim] = useState<'idle' | 'attack' | 'hurt'>('idle');
  const [newEnemyIndex, setNewEnemyIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const prevHintLevelRef = useRef(0);
  let submitInputRef = useRef<TextInput>(null);
  const variablesToLookFor: [number, number] = [
    previousNumOfEnemies,
    numOfEnemies,
  ];
  const { msg, isErrorMessage } = useMsgAfterSubmit(
    variablesToLookFor,
    isStoredState,
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (isStoredState) return;
    if (numOfEnemies < previousNumOfEnemies) {
      if (soundEnabled) {
        playCorrectSound();
        playEnemyDefeatSound();
      }
      // Correct answer confetti
      setDefeatingEnemy(true);
      setHeroAnim('attack');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDefeatingEnemy(false), 500);
      setTimeout(() => setHeroAnim('idle'), 400);
    } else if (numOfEnemies > previousNumOfEnemies) {
      if (soundEnabled) playIncorrectSound();
      setNewEnemyIndex(numOfEnemies - 1);
      setTimeout(() => setNewEnemyIndex(null), 500);
    }
  }, [numOfEnemies, previousNumOfEnemies, isStoredState, soundEnabled]);

  // Wrong answer shake
  useEffect(() => {
    if (hintLevel > 0 && hintLevel > prevHintLevelRef.current) {
      setShaking(true);
      setHeroAnim('hurt');
      const timer = setTimeout(() => {
        setShaking(false);
        setHeroAnim('idle');
      }, 400);
      return () => clearTimeout(timer);
    }
    prevHintLevelRef.current = hintLevel;
  }, [hintLevel]);

  // Complete level on victory
  useEffect(() => {
    if (won && currentLevel && gameScreen === 'playing') {
      dispatch({ type: TYPES.COMPLETE_LEVEL });
    }
  }, [won, currentLevel, gameScreen]);

  // Save daily challenge result on victory
  useEffect(() => {
    if (won && isDailyChallenge) {
      const accuracy =
        totalAttempts > 0
          ? Math.round((correctAttempts / totalAttempts) * 100)
          : 0;
      saveDailyResult({
        date: getTodayKey(),
        score,
        accuracy,
        completed: true,
      });
    }
  }, [won, isDailyChallenge, score, correctAttempts, totalAttempts]);

  // Victory celebration confetti + fanfare
  useEffect(() => {
    if (!won) return;
    if (soundEnabled) playVictoryFanfare();
    const end = Date.now() + 3000;
    const interval = setInterval(() => {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });
      if (Date.now() > end) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [won]);
  const handleSoundToggle = useCallback(() => {
    dispatch({ type: TYPES.SET_SOUND_ENABLED, payload: !soundEnabled });
  }, [dispatch, soundEnabled]);
  const handleHighContrastToggle = useCallback(() => {
    dispatch({ type: TYPES.SET_HIGH_CONTRAST, payload: !highContrast });
  }, [dispatch, highContrast]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: TYPES.SET_ANSWER, payload: '' });
    },
    [dispatch],
  );
  const handleAnswerChange = useCallback(
    (value: string) => {
      if (/^-?\d*\.?\d*$/.test(value.toString()) || value === '')
        dispatch({ type: TYPES.SET_ANSWER, payload: value });
    },
    [dispatch],
  );
  const handleModePicker = useCallback(
    (mode: string) => {
      dispatch({ type: TYPES.SET_MODE, payload: mode });
    },
    [dispatch],
  );
  const handleModeType = useCallback(
    (mode: string) => {
      dispatch({ type: TYPES.SET_MODE_TYPES, payload: mode });
    },
    [dispatch],
  );
  const handleDifficultyPicker = useCallback(
    (difficulty: string) => {
      dispatch({ type: TYPES.SET_DIFFICULTY, payload: difficulty });
    },
    [dispatch],
  );
  const handleRestart = useCallback(() => {
    dispatch({ type: TYPES.RESTART });
  }, [dispatch]);
  const handleDismissTutorial = useCallback(() => {
    dispatch({ type: TYPES.DISMISS_TUTORIAL });
  }, [dispatch]);
  const handleShowTutorial = useCallback(() => {
    dispatch({ type: TYPES.SHOW_TUTORIAL });
  }, [dispatch]);
  const handleSelectLevel = useCallback(
    (level: Level) => {
      dispatch({ type: TYPES.SELECT_LEVEL, payload: level });
    },
    [dispatch],
  );
  const handleFreePlay = useCallback(() => {
    dispatch({ type: TYPES.PLAY_FREE });
  }, [dispatch]);
  const handleDailyChallenge = useCallback(() => {
    const problems = generateDailyProblems();
    dispatch({ type: TYPES.START_DAILY_CHALLENGE, payload: problems });
  }, [dispatch]);
  const handleBackToLevels = useCallback(() => {
    dispatch({ type: TYPES.BACK_TO_LEVELS });
  }, [dispatch]);
  const handleSubmit = useCallback(() => {
    dispatch({ type: TYPES.CHECK_ANSWER });
    setTimeout(() => {
      if (submitInputRef.current) submitInputRef.current.focus();
    }, 50);
  }, [dispatch]);
  const activeTheme = highContrast ? themes.highContrast : themes[mode];
  useEffect(() => {
    dispatch({ type: TYPES.NEW_PROBLEM });
    const storedData = localStorage.getItem('state');
    if (storedData) {
      dispatch({ type: TYPES.RESTORE_STATE, payload: JSON.parse(storedData) });
    } else {
      dispatch({ type: TYPES.SHOW_TUTORIAL });
      localStorage.setItem(
        'state',
        JSON.stringify({
          answer,
          numOfEnemies,
          val1,
          val2,
          won,
          operator,
          mode,
          difficulty,
          modeType,
          previousNumOfEnemies,
          hasSeenTutorial: false,
        }),
      );
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      'state',
      JSON.stringify({
        answer,
        numOfEnemies,
        val1,
        val2,
        won,
        operator,
        mode,
        difficulty,
        modeType,
        previousNumOfEnemies,
        hasSeenTutorial,
        levelProgress,
        locale,
      }),
    );
  }, [
    answer,
    numOfEnemies,
    won,
    val1,
    val2,
    operator,
    mode,
    difficulty,
    modeType,
    previousNumOfEnemies,
    hasSeenTutorial,
    levelProgress,
    locale,
  ]);
  const submitMsgText = isErrorMessage
    ? highContrast
      ? styles.msgTextErrorHC
      : styles.msgTextError
    : highContrast
      ? styles.msgTextSuccessHC
      : styles.msgTextSuccess;
  const submitMessageBlock = !!msg && (
    <View style={styles.submitMsgWrapper} accessibilityLiveRegion="polite">
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  );
  useEffect(() => {
    submitInputRef.current && submitInputRef.current.focus();
  }, [val1, val2]);
  useEffect(() => {
    if (won) return;
    dispatch({ type: TYPES.START_TIMER });
    setTimeLeft(isBossLevel ? 20 : 30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [val1, val2, won, isBossLevel]);
  useEffect(() => {
    if (lastPointsEarned == null) return;
    setShowPoints(true);
    if (pointsTimeoutRef.current) clearTimeout(pointsTimeoutRef.current);
    pointsTimeoutRef.current = setTimeout(() => setShowPoints(false), 1500);
    return () => {
      if (pointsTimeoutRef.current) clearTimeout(pointsTimeoutRef.current);
    };
  }, [lastPointsEarned, val1, val2]);
  // Streak milestone popup
  useEffect(() => {
    if (streak < 3) {
      setStreakLabel(null);
      return;
    }
    const milestone = getStreakMilestone(streak);
    if (milestone) {
      if (soundEnabled) playStreakMilestoneSound();
      setStreakLabel(`${milestone.label} +${milestone.bonus}`);
      const timer = setTimeout(() => setStreakLabel(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  const streakGlowStyle =
    streak >= 10
      ? ({
          boxShadow: '0 0 20px rgba(255, 50, 0, 0.6)',
          animationName: 'fireGlow',
          animationDuration: '1.5s',
          animationIterationCount: 'infinite',
        } as any)
      : streak >= 5
        ? ({
            boxShadow: '0 0 12px rgba(255, 100, 0, 0.4)',
            animationName: 'fireGlow',
            animationDuration: '2s',
            animationIterationCount: 'infinite',
          } as any)
        : undefined;

  const heroAnimStyle: Record<string, React.CSSProperties> = {
    idle: {
      animationName: 'heroIdle',
      animationDuration: '2s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'ease-in-out',
    },
    attack: {
      animationName: 'heroAttack',
      animationDuration: '0.4s',
      animationIterationCount: 1 as any,
      animationTimingFunction: 'ease-out',
    },
    hurt: {
      animationName: 'heroHurt',
      animationDuration: '0.4s',
      animationIterationCount: 1 as any,
    },
  };
  const timerColor =
    timeLeft > 15 ? '#4caf50' : timeLeft > 5 ? '#ff9800' : '#f44336';

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: activeTheme.backgroundColor,
          backgroundImage: highContrast
            ? activeTheme.gradient
            : `url(${bgImages[mode] || bgImages.addition})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.3s ease',
        } as any,
      ]}
    >
      {showTutorial && <Tutorial onDismiss={handleDismissTutorial} t={t} />}
      <View style={styles.gameContainer}>
        <BackgroundSound url={musicTracks[mode] || musicTracks.addition} />
        <View style={styles.content}>
          {/* === TOP BAR: Title + Score + Settings gear === */}
          <View style={styles.topBar}>
            <Text
              style={[
                styles.title,
                isMobile && { fontSize: 22 },
                { color: activeTheme.textColor },
              ]}
              accessibilityRole="header"
            >
              {t.title}
            </Text>
            <View style={styles.topBarRight}>
              {gameScreen !== 'levelSelect' && (
                <TouchableOpacity
                  onPress={handleBackToLevels}
                  style={styles.levelsButton}
                  accessibilityLabel="Back to level select"
                  accessibilityRole="button"
                  testID="levels-button"
                >
                  <Text style={styles.levelsButtonText}>{'\u2630'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowSettings(!showSettings)}
                style={styles.gearButton}
                accessibilityLabel={
                  showSettings ? 'Hide settings' : 'Show settings'
                }
                accessibilityRole="button"
                testID="settings-toggle"
              >
                <Text style={styles.gearButtonText}>{'\u2699'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShowTutorial}
                style={styles.helpButton}
                accessibilityLabel="Show tutorial"
                accessibilityRole="button"
                testID="help-button"
              >
                <Text style={styles.helpButtonText}>?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* === SCORE BAR === */}
          {gameScreen !== 'levelSelect' && (
            <View
              style={[
                styles.scoreBar,
                styles.cardPanel,
                isMobile && {
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  padding: 8,
                  marginVertical: 2,
                },
                streakGlowStyle,
              ]}
              accessibilityLiveRegion="polite"
            >
              <Text
                style={[styles.timerText, { color: timerColor }]}
                testID="timer"
              >{`\u23F1 ${timeLeft}s`}</Text>
              <Text
                style={[styles.scoreText, { color: '#fff' }]}
                testID="score"
              >{`${t.score}: ${score}`}</Text>
              <Text
                style={[styles.bestScoreText, { color: '#fff' }]}
                testID="best-score"
              >{`${t.best}: ${bestScore}`}</Text>
              {showPoints && lastPointsEarned != null && (
                <Text
                  style={[
                    styles.pointsEarned,
                    {
                      color: lastPointsEarned > 0 ? '#4caf50' : '#f44336',
                      animationName: 'floatUp',
                      animationDuration: '1.5s',
                      animationFillMode: 'forwards',
                    } as any,
                  ]}
                  testID="points-earned"
                >{`+${lastPointsEarned}`}</Text>
              )}
              {streak >= 3 && (
                <Text
                  style={[
                    styles.streakText,
                    streak >= 10
                      ? styles.streakLegendary
                      : streak >= 5
                        ? styles.streakFire
                        : undefined,
                  ]}
                  testID="streak-counter"
                >{`\uD83D\uDD25 \u00D7${streak}`}</Text>
              )}
              {streakLabel && (
                <Text
                  style={[
                    styles.streakMilestone,
                    {
                      animationName: 'victoryBounce',
                      animationDuration: '0.5s',
                      animationFillMode: 'forwards',
                    } as any,
                  ]}
                >
                  {streakLabel}
                </Text>
              )}
            </View>
          )}

          {/* === LEVEL SELECT SCREEN === */}
          {gameScreen === 'levelSelect' && (
            <LevelSelect
              progress={levelProgress}
              onSelectLevel={handleSelectLevel}
              onFreePlay={handleFreePlay}
              onDailyChallenge={handleDailyChallenge}
              t={t}
            />
          )}

          {/* === COLLAPSIBLE SETTINGS === */}
          {gameScreen !== 'levelSelect' && showSettings && (
            <View style={[styles.cardPanel, styles.settingsPanel]}>
              <View style={styles.pickerContainer}>
                <SegmentedButtonGroup
                  options={OPERATIONS}
                  selectedValue={mode}
                  onSelect={handleModePicker}
                  accessibilityLabel="Select math operation"
                  testID="operation-selector"
                />
                <SegmentedButtonGroup
                  options={DIFFICULTIES}
                  selectedValue={difficulty}
                  onSelect={handleDifficultyPicker}
                  accessibilityLabel="Select difficulty level"
                  testID="difficulty-selector"
                />
                <SegmentedButtonGroup
                  options={MODE_TYPES}
                  selectedValue={modeType}
                  onSelect={handleModeType}
                  accessibilityLabel="Select number mode"
                  testID="modeType-selector"
                />
                <SegmentedButtonGroup
                  options={[
                    { label: t.typeMode, value: 'type' },
                    { label: t.chooseMode, value: 'choose' },
                  ]}
                  selectedValue={answerMode}
                  onSelect={(v) =>
                    dispatch({ type: TYPES.SET_ANSWER_MODE, payload: v })
                  }
                  accessibilityLabel="Select answer mode"
                  testID="answer-mode-selector"
                />
                <SegmentedButtonGroup
                  options={[
                    { label: 'EN', value: 'en' },
                    { label: 'ES', value: 'es' },
                    { label: 'FR', value: 'fr' },
                  ]}
                  selectedValue={locale}
                  onSelect={(v) =>
                    dispatch({ type: TYPES.SET_LOCALE, payload: v })
                  }
                  accessibilityLabel="Select language"
                  testID="language-selector"
                />
              </View>
              <View style={styles.soundControls}>
                <TouchableOpacity
                  onPress={handleSoundToggle}
                  style={styles.touchTarget}
                  accessibilityLabel={
                    soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'
                  }
                  accessibilityRole="button"
                  testID="sound-toggle"
                >
                  <Text
                    style={[
                      styles.soundToggleText,
                      highContrast && highContrastStyles.settingsButton,
                    ]}
                  >
                    {soundEnabled ? t.sfxOn : t.sfxOff}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleHighContrastToggle}
                  style={styles.touchTarget}
                  accessibilityLabel={
                    highContrast
                      ? 'Disable high contrast mode'
                      : 'Enable high contrast mode'
                  }
                  accessibilityRole="button"
                  testID="high-contrast-toggle"
                >
                  <Text
                    style={[
                      styles.soundToggleText,
                      highContrast && highContrastStyles.settingsButton,
                    ]}
                  >
                    {highContrast ? 'HC' : 'HC'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {gameScreen !== 'levelSelect' && (
            <>
              <View
                style={[
                  styles.battlefield,
                  isMobile && styles.battlefieldMobile,
                ]}
              >
                <View style={styles.heroContainer}>
                  <View
                    nativeID="hero"
                    accessibilityLabel="Your hero character"
                  >
                    <Image
                      source={won ? heroImages.victory : heroImages[heroAnim]}
                      style={[
                        isMobile
                          ? styles.characterImageMobile
                          : styles.characterImage,
                        heroAnimStyle[heroAnim] as any,
                      ]}
                      accessibilityLabel="Hero"
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.enemiesContainer,
                    isMobile && styles.enemiesContainerMobile,
                  ]}
                >
                  {!isBossLevel && (
                    <Text style={styles.enemyCountText} testID="enemy-count">
                      {`Enemies: ${numOfEnemies}`}
                    </Text>
                  )}
                  {isBossLevel ? (
                    <View testID="enemies" style={{ alignItems: 'center' }}>
                      <View
                        style={
                          defeatingEnemy && bossHP <= 0
                            ? ({
                                animationName: 'enemyDefeat',
                                animationDuration: '0.5s',
                                animationFillMode: 'forwards',
                              } as any)
                            : undefined
                        }
                      >
                        <Image
                          source={enemyImages[mode] || enemyImages.addition}
                          style={[
                            styles.bossImage,
                            {
                              boxShadow:
                                '0 0 30px rgba(255, 80, 0, 0.7), 0 0 60px rgba(255, 0, 0, 0.4)',
                            } as any,
                            defeatingEnemy && bossHP <= 0
                              ? undefined
                              : ({
                                  animationName: 'bossEntrance',
                                  animationDuration: '0.8s',
                                  animationFillMode: 'forwards',
                                  animationIterationCount:
                                    numOfEnemies > 0 ? 1 : undefined,
                                } as any),
                          ]}
                          accessibilityLabel="Boss Enemy"
                        />
                      </View>
                      <View style={styles.bossHPBar}>
                        <View
                          style={[
                            styles.bossHPFill,
                            {
                              width: `${(bossHP / bossMaxHP) * 100}%`,
                            },
                          ]}
                        />
                        <Text
                          style={styles.bossHPText}
                        >{`${bossHP} / ${bossMaxHP}`}</Text>
                      </View>
                    </View>
                  ) : (
                    [...Array(numOfEnemies)].map((_, i) => (
                      <View
                        testID="enemies"
                        key={i}
                        style={
                          defeatingEnemy && i === numOfEnemies - 1
                            ? ({
                                animationName: 'enemyDefeat',
                                animationDuration: '0.5s',
                                animationFillMode: 'forwards',
                              } as any)
                            : undefined
                        }
                      >
                        <Image
                          source={enemyImages[mode] || enemyImages.addition}
                          style={[
                            isMobile
                              ? styles.characterImageMobile
                              : styles.characterImage,
                            defeatingEnemy && i === numOfEnemies - 1
                              ? undefined
                              : newEnemyIndex === i
                                ? ({
                                    animationName: 'enemyEntrance',
                                    animationDuration: '0.5s',
                                    animationFillMode: 'forwards',
                                  } as any)
                                : ({
                                    animationName: 'enemySway',
                                    animationDuration: '1.5s',
                                    animationIterationCount: 'infinite',
                                    animationTimingFunction: 'ease-in-out',
                                    animationDelay: `${i * 0.3}s`,
                                  } as any),
                          ]}
                          accessibilityLabel={`Enemy ${i + 1}`}
                        />
                      </View>
                    ))
                  )}
                </View>
              </View>
              {/* === ATTEMPT HEARTS === */}
              {!won && (
                <View
                  style={[
                    styles.heartsContainer,
                    isMobile && { paddingVertical: 2, gap: 4 },
                  ]}
                  testID="hearts-container"
                >
                  {[0, 1, 2].map((i) => (
                    <Text
                      key={i}
                      style={[
                        styles.heart,
                        i < 3 - attempts ? styles.heartFull : styles.heartEmpty,
                        i === 3 - attempts && attempts > 0 && hintLevel > 0
                          ? ({
                              animationName: 'heartBreak',
                              animationDuration: '0.5s',
                            } as any)
                          : undefined,
                      ]}
                      accessibilityLabel={
                        i < 3 - attempts ? 'Heart full' : 'Heart empty'
                      }
                    >
                      {i < 3 - attempts ? '\u2764\uFE0F' : '\uD83D\uDDA4'}
                    </Text>
                  ))}
                </View>
              )}
              {won ? (
                <View style={[styles.cardPanel, styles.victoryPanel]}>
                  <Text
                    style={[
                      styles.victoryText,
                      {
                        animationName: 'victoryBounce',
                        animationDuration: '0.8s',
                        animationFillMode: 'forwards',
                      } as any,
                    ]}
                    accessibilityRole="text"
                  >
                    {t.victory}
                  </Text>
                  <View
                    style={styles.starsContainer}
                    nativeID="stars-container"
                  >
                    {[0, 1, 2].map((i) => (
                      <Text
                        key={i}
                        style={[
                          styles.star,
                          i < starsEarned
                            ? ({
                                color: '#FFD93D',
                                animationName: 'starEarned',
                                animationDuration: '0.5s',
                                animationDelay: `${i * 0.5}s`,
                                animationFillMode: 'both',
                              } as any)
                            : { color: '#666' },
                        ]}
                      >
                        {i < starsEarned ? '\u2605' : '\u2606'}
                      </Text>
                    ))}
                  </View>
                  <Text
                    style={styles.victoryStats}
                    accessibilityRole="text"
                  >{`${t.accuracy}: ${totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0}%`}</Text>
                  <Text
                    style={styles.victoryScore}
                    accessibilityRole="text"
                  >{`${t.finalScore}: ${score}`}</Text>
                  <Text
                    style={styles.victoryBest}
                    accessibilityRole="text"
                  >{`${t.bestScore}: ${bestScore}`}</Text>
                  {maxStreak >= 3 && (
                    <Text
                      style={styles.victoryBest}
                      accessibilityRole="text"
                    >{`${t.bestStreak}: \uD83D\uDD25 \u00D7${maxStreak}`}</Text>
                  )}
                  <TouchableOpacity
                    onPress={handleRestart}
                    style={[
                      styles.restartButton,
                      {
                        backgroundColor: activeTheme.buttonColor,
                        animationName: 'pulse',
                        animationDuration: '1.5s',
                        animationIterationCount: 'infinite',
                      } as any,
                    ]}
                    accessibilityLabel="Play again"
                    accessibilityRole="button"
                  >
                    <Text style={styles.restartButtonText}>{t.playAgain}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleBackToLevels}
                    style={styles.backToLevelsButton}
                    accessibilityLabel="Back to level select"
                    accessibilityRole="button"
                    testID="back-to-levels"
                  >
                    <Text style={styles.backToLevelsText}>
                      {t.backToLevels}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    styles.mathContainer,
                    styles.cardPanel,
                    isMobile && {
                      paddingVertical: 8,
                      padding: 10,
                      marginVertical: 4,
                    },
                    shaking
                      ? ({
                          animationName: 'shake',
                          animationDuration: '0.5s',
                        } as any)
                      : undefined,
                  ]}
                >
                  {submitMessageBlock}
                  {hintLevel > 0 && hintLevel < 3 && (
                    <View style={styles.hintBubble}>
                      <Text style={styles.hintText}>
                        {generateHint(val1, val2, operator, hintLevel)}
                      </Text>
                    </View>
                  )}
                  {hintLevel === 3 && (
                    <View style={[styles.hintBubble, styles.hintBubbleAnswer]}>
                      <Text style={styles.hintText}>
                        {generateHint(val1, val2, operator, 3)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.mathRow}>
                    <Text
                      nativeID="val1"
                      style={[
                        styles.mathText,
                        isMobile && { fontSize: 28 },
                        { color: '#fff' },
                      ]}
                    >
                      {val1 < 0 ? `(${val1})` : val1}
                    </Text>
                    <Text
                      nativeID="operator"
                      style={[
                        styles.mathText,
                        isMobile && { fontSize: 28 },
                        { color: '#fff' },
                      ]}
                    >
                      {displayOperator(operator)}
                    </Text>
                    <Text
                      nativeID="val2"
                      style={[
                        styles.mathText,
                        isMobile && { fontSize: 28 },
                        { color: '#fff' },
                      ]}
                    >
                      {val2 < 0 ? `(${val2})` : val2}
                    </Text>
                    <Text
                      style={[
                        styles.mathText,
                        isMobile && { fontSize: 28 },
                        { color: '#fff' },
                      ]}
                    >
                      =
                    </Text>
                    {answerMode !== 'choose' &&
                      (isMobile ? (
                        <Text
                          nativeID="answer-input"
                          style={[
                            styles.input,
                            highContrast && highContrastStyles.input,
                            { lineHeight: 40, height: 40, fontSize: 22 },
                          ]}
                          accessibilityLabel="Current answer"
                        >
                          {answer || ' '}
                        </Text>
                      ) : (
                        <TextInput
                          nativeID="answer-input"
                          style={[
                            styles.input,
                            highContrast && highContrastStyles.input,
                          ]}
                          onChangeText={handleAnswerChange}
                          onSubmitEditing={handleSubmit}
                          onKeyPress={handleKeyDown as any}
                          value={answer}
                          ref={submitInputRef}
                          accessibilityLabel="Enter your answer"
                        />
                      ))}
                  </View>
                  {answerMode === 'choose' ? (
                    <View style={styles.choiceGrid}>
                      {choices.map((choice, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.choiceButton,
                            { backgroundColor: activeTheme.buttonColor },
                          ]}
                          onPress={() => {
                            dispatch({
                              type: TYPES.SET_ANSWER,
                              payload: String(choice),
                            });
                            setTimeout(
                              () => dispatch({ type: TYPES.CHECK_ANSWER }),
                              100,
                            );
                          }}
                          accessibilityLabel={`Answer ${choice}`}
                          accessibilityRole="button"
                        >
                          <Text style={styles.choiceButtonText}>{choice}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : isMobile ? (
                    <View style={styles.submitRow}>
                      <NumberPad
                        value={answer}
                        onChange={handleAnswerChange}
                        onSubmit={handleSubmit}
                        showMinus={modeType === 'negative'}
                        showDecimal={modeType === 'decimals'}
                        buttonColor={activeTheme.buttonColor}
                        compact
                      />
                    </View>
                  ) : (
                    <View style={styles.submitRow}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          { backgroundColor: activeTheme.buttonColor },
                          highContrast && highContrastStyles.button,
                        ]}
                        testID="submit"
                        onPress={handleSubmit}
                        accessibilityLabel="Submit answer"
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            highContrast && highContrastStyles.buttonText,
                          ]}
                        >
                          {t.submit}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'auto' as any,
  },
  gameContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
  },
  topBar: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  topBarRight: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gearButtonText: {
    fontSize: 22,
    color: '#fff',
  },
  scoreBar: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    width: '100%',
  },
  settingsPanel: {
    marginBottom: 4,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    width: '100%',
  },
  pickerContainer: { flexDirection: 'column', gap: 4, width: '100%' },
  segmentedGroup: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
    width: '100%',
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentedButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: '#fff',
  },
  segmentedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '600',
  },
  battlefield: {
    flexDirection: 'row' as const,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  battlefieldMobile: {
    paddingVertical: 4,
    gap: 4,
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  enemiesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  enemiesContainerMobile: {
    gap: 2,
    justifyContent: 'center',
  },
  characterImage: { width: 120, height: 120, resizeMode: 'contain' as any },
  characterImageMobile: { width: 60, height: 60, resizeMode: 'contain' as any },
  heartsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 4,
  },
  heart: {
    fontSize: 22,
  },
  heartFull: {
    opacity: 1,
  },
  heartEmpty: {
    opacity: 0.4,
  },
  mathContainer: { paddingVertical: 16, alignItems: 'center' },
  choiceGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: 8,
    width: 280,
    alignSelf: 'center' as const,
  },
  choiceButton: {
    width: 130,
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  choiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    fontFamily: '"Poppins", sans-serif',
    color: '#fff',
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
    flexWrap: 'wrap',
  },
  mathText: {
    fontSize: 40,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    maxWidth: 280,
    height: 56,
    fontSize: 28,
    borderRadius: 12,
    textAlign: 'center' as any,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    color: '#fff',
    fontFamily: '"Poppins", sans-serif',
    marginLeft: 8,
  },
  submitRow: { alignItems: 'center', width: '100%' },
  button: {
    width: '100%',
    maxWidth: 280,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#841584',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700',
  },
  victoryPanel: { alignItems: 'center' },
  victoryText: {
    color: '#fff',
    fontSize: 32,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
  },
  victoryScore: {
    color: '#fff',
    fontSize: 24,
    fontFamily: '"Poppins", sans-serif',
    paddingVertical: 8,
  },
  victoryBest: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontFamily: '"Poppins", sans-serif',
    paddingBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  star: {
    fontSize: 56,
    fontFamily: '"Poppins", sans-serif',
  },
  victoryStats: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: '"Poppins", sans-serif',
    paddingBottom: 4,
  },
  restartButton: {
    width: '100%',
    maxWidth: 280,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    marginTop: 8,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700',
  },
  touchTarget: { minHeight: 44, justifyContent: 'center' },
  msgTextError: {
    color: '#FFD93D',
    fontSize: 22,
    fontWeight: 'bold' as const,
    fontFamily: '"Quicksand", sans-serif',
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  msgTextSuccess: {
    color: '#69ff69',
    fontSize: 22,
    fontWeight: 'bold' as const,
    fontFamily: '"Quicksand", sans-serif',
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  submitMsgWrapper: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'center' as const,
  },
  hintBubble: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    maxWidth: 340,
    alignSelf: 'center' as const,
  },
  hintBubbleAnswer: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  hintText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    fontFamily: '"Quicksand", sans-serif',
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  soundControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  soundToggleText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: '"Quicksand", sans-serif',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  scoreTimerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: '"Poppins", sans-serif',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: '"Poppins", sans-serif',
  },
  bestScoreText: {
    fontSize: 16,
    fontFamily: '"Poppins", sans-serif',
    opacity: 0.8,
  },
  pointsEarned: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: '"Poppins", sans-serif',
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    fontFamily: '"Poppins", sans-serif',
    color: '#FFD93D',
  },
  streakFire: {
    fontSize: 22,
    color: '#FF8C00',
    textShadowColor: 'rgba(255, 100, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  streakLegendary: {
    fontSize: 24,
    color: '#FF4500',
    textShadowColor: 'rgba(255, 50, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  streakMilestone: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    fontFamily: '"Fredoka One", sans-serif',
    color: '#FFD93D',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700',
  },
  levelsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  levelsButtonText: {
    fontSize: 22,
    color: '#fff',
  },
  backToLevelsButton: {
    width: '100%',
    maxWidth: 280,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  backToLevelsText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '600' as const,
  },
  bossHPBar: {
    width: '80%',
    maxWidth: 200,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    overflow: 'hidden' as any,
    alignSelf: 'center' as const,
    marginTop: 4,
    position: 'relative' as const,
  },
  bossHPFill: {
    height: '100%',
    backgroundColor: '#f44336',
    borderRadius: 10,
  },
  bossHPText: {
    position: 'absolute' as const,
    width: '100%',
    textAlign: 'center' as const,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
    fontFamily: '"Poppins", sans-serif',
    lineHeight: 20,
  },
  bossImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain' as any,
  },
  enemyCount: { paddingVertical: 4 },
  enemyCountText: {
    fontSize: 16,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    width: '100%',
    textAlign: 'center' as any,
    paddingBottom: 2,
  },
  msgTextErrorHC: {
    color: '#FFD93D',
    fontSize: 22,
    fontWeight: 'bold' as const,
    fontFamily: '"Quicksand", sans-serif',
    textAlign: 'center' as const,
  },
  msgTextSuccessHC: {
    color: '#69ff69',
    fontSize: 22,
    fontWeight: 'bold' as const,
    fontFamily: '"Quicksand", sans-serif',
    textAlign: 'center' as const,
  },
});
const highContrastStyles = StyleSheet.create({
  input: {
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#000',
    color: '#fff',
  },
  button: { borderColor: '#fff', borderWidth: 3 },
  buttonText: { color: '#000', fontWeight: 'bold' },
  settingsButton: {
    borderColor: '#fff',
    borderWidth: 2,
    backgroundColor: '#000',
    color: '#fff',
  },
});
const themes: Record<
  string,
  {
    backgroundColor: string;
    gradient: string;
    buttonColor: string;
    textColor: string;
  }
> = {
  addition: {
    backgroundColor: '#FF8C00',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF8C00 100%)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  subtraction: {
    backgroundColor: '#1565C0',
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #1565C0 100%)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  multiplication: {
    backgroundColor: '#37474F',
    gradient: 'linear-gradient(135deg, #78909C 0%, #37474F 100%)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  division: {
    backgroundColor: '#00695C',
    gradient: 'linear-gradient(135deg, #4DB6AC 0%, #00695C 100%)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  highContrast: {
    backgroundColor: '#000',
    gradient: 'linear-gradient(135deg, #000000 0%, #1a1a2e 100%)',
    buttonColor: '#fff',
    textColor: '#fff',
  },
};
export default App;
