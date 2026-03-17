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
import { reducer, initialState, TYPES } from './AppReducer';
import { useMsgAfterSubmit } from './hooks';
import { generateHint } from './utils';

import HeroSvg from './components/HeroSvg';
import bgSound from './assets/music/background-music.mp3';
import BackgroundSound from './components/BackgroundSound';
import { playCorrectSound, playIncorrectSound } from './utils/SoundEffects';

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

const DIFFICULTIES = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

const MODE_TYPES = [
  { label: 'Whole', value: 'wholeNumber' },
  { label: 'Decimal', value: 'decimal' },
  { label: 'Negative', value: 'negative' },
];

function SegmentedButtonGroup({
  options,
  selectedValue,
  onSelect,
  accessibilityLabel,
  testID,
  disabled,
}: {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  accessibilityLabel: string;
  testID?: string;
  disabled?: boolean;
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
              disabled && styles.segmentedButtonDisabled,
            ]}
            onPress={() => !disabled && onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive, disabled }}
            accessibilityLabel={option.label}
          >
            <Text
              style={[
                styles.segmentedButtonText,
                disabled && styles.segmentedButtonTextDisabled,
              ]}
            >
              {option.label}
            </Text>
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
      adaptiveDifficulty,
      adaptiveMessage,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const [timeLeft, setTimeLeft] = useState(30);
  const [showPoints, setShowPoints] = useState(false);
  const [showAdaptiveMsg, setShowAdaptiveMsg] = useState(false);
  const [adaptiveMsgText, setAdaptiveMsgText] = useState<string | null>(null);
  const [adaptiveMsgIsUp, setAdaptiveMsgIsUp] = useState(false);
  const pointsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adaptiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let submitInputRef = useRef<TextInput>(null);

  const variablesToLookFor: [number, number] = [
    previousNumOfEnemies,
    numOfEnemies,
  ];
  const { msg, isErrorMessage } = useMsgAfterSubmit(
    variablesToLookFor,
    isStoredState,
  );

  // Play sound effects on correct/incorrect answers
  useEffect(() => {
    if (isStoredState) return;
    if (numOfEnemies < previousNumOfEnemies) {
      if (soundEnabled) playCorrectSound();
    } else if (numOfEnemies > previousNumOfEnemies) {
      if (soundEnabled) playIncorrectSound();
    }
  }, [numOfEnemies, previousNumOfEnemies, isStoredState, soundEnabled]);

  // Show adaptive difficulty change message
  useEffect(() => {
    if (!adaptiveMessage) return;
    const isUp = adaptiveMessage.includes('harder');
    setAdaptiveMsgText(adaptiveMessage);
    setAdaptiveMsgIsUp(isUp);
    setShowAdaptiveMsg(true);
    if (adaptiveTimeoutRef.current) clearTimeout(adaptiveTimeoutRef.current);
    adaptiveTimeoutRef.current = setTimeout(
      () => setShowAdaptiveMsg(false),
      1500,
    );
    return () => {
      if (adaptiveTimeoutRef.current) clearTimeout(adaptiveTimeoutRef.current);
    };
  }, [adaptiveMessage, val1, val2]);

  const handleSoundToggle = useCallback(() => {
    dispatch({
      type: TYPES.SET_SOUND_ENABLED,
      payload: !soundEnabled,
    });
  }, [dispatch, soundEnabled]);

  const handleHighContrastToggle = useCallback(() => {
    dispatch({
      type: TYPES.SET_HIGH_CONTRAST,
      payload: !highContrast,
    });
  }, [dispatch, highContrast]);

  const handleAdaptiveToggle = useCallback(() => {
    dispatch({
      type: TYPES.SET_ADAPTIVE,
      payload: !adaptiveDifficulty,
    });
  }, [dispatch, adaptiveDifficulty]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: TYPES.SET_ANSWER, payload: '' });
      }
    },
    [dispatch],
  );

  const handleAnswerChange = useCallback(
    (value: string) => {
      if (/^-?\d*\.?\d*$/.test(value.toString()) || value === '') {
        dispatch({ type: TYPES.SET_ANSWER, payload: value });
      }
    },
    [dispatch],
  );

  const handleModePicker = useCallback(
    (mode: string) => {
      dispatch({
        type: TYPES.SET_MODE,
        payload: mode,
      });
    },
    [dispatch],
  );

  const handleModeType = useCallback(
    (mode: string) => {
      dispatch({
        type: TYPES.SET_MODE_TYPES,
        payload: mode,
      });
    },
    [dispatch],
  );

  const handleDifficultyPicker = useCallback(
    (difficulty: string) => {
      dispatch({
        type: TYPES.SET_DIFFICULTY,
        payload: difficulty,
      });
    },
    [dispatch],
  );

  const handleRestart = useCallback(() => {
    dispatch({ type: TYPES.RESTART });
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    dispatch({ type: TYPES.CHECK_ANSWER });
    if (submitInputRef.current) submitInputRef.current.focus();
  }, [dispatch]);

  const activeTheme = highContrast ? themes.highContrast : themes[mode];

  useEffect(() => {
    dispatch({ type: TYPES.NEW_PROBLEM });
    const storedData = localStorage.getItem('state');
    if (storedData) {
      dispatch({ type: TYPES.RESTORE_STATE, payload: JSON.parse(storedData) });
    } else {
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
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [val1, val2, won]);

  useEffect(() => {
    if (lastPointsEarned === null) return;
    setShowPoints(true);
    if (pointsTimeoutRef.current) clearTimeout(pointsTimeoutRef.current);
    pointsTimeoutRef.current = setTimeout(() => setShowPoints(false), 1500);
    return () => {
      if (pointsTimeoutRef.current) clearTimeout(pointsTimeoutRef.current);
    };
  }, [lastPointsEarned, val1, val2]);

  const timerColor =
    timeLeft > 15 ? '#4caf50' : timeLeft > 5 ? '#ff9800' : '#f44336';

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: activeTheme.backgroundColor,
          backgroundImage: activeTheme.gradient,
          transition: 'background-image 0.5s ease',
        } as any,
      ]}
    >
      <View style={styles.gameContainer}>
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: activeTheme.textColor }]}
            accessibilityRole="header"
          >
            Battle Math
          </Text>
          <View style={styles.cardPanel}>
            <View style={styles.pickerContainer}>
              <SegmentedButtonGroup
                options={OPERATIONS}
                selectedValue={mode}
                onSelect={handleModePicker}
                accessibilityLabel="Select math operation"
                testID="operation-selector"
              />

              <View style={styles.difficultyRow}>
                <View style={styles.difficultyButtonsWrapper}>
                  <SegmentedButtonGroup
                    options={DIFFICULTIES}
                    selectedValue={difficulty}
                    onSelect={handleDifficultyPicker}
                    accessibilityLabel="Select difficulty level"
                    testID="difficulty-selector"
                    disabled={adaptiveDifficulty}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleAdaptiveToggle}
                  style={[
                    styles.adaptiveToggle,
                    adaptiveDifficulty && styles.adaptiveToggleActive,
                  ]}
                  accessibilityLabel={
                    adaptiveDifficulty
                      ? 'Disable adaptive difficulty'
                      : 'Enable adaptive difficulty'
                  }
                  accessibilityRole="button"
                  testID="adaptive-toggle"
                >
                  <Text
                    style={[
                      styles.adaptiveToggleText,
                      adaptiveDifficulty && styles.adaptiveToggleTextActive,
                    ]}
                  >
                    {adaptiveDifficulty ? 'Adaptive \u2713' : 'Adaptive'}
                  </Text>
                </TouchableOpacity>
              </View>

              <SegmentedButtonGroup
                options={MODE_TYPES}
                selectedValue={modeType}
                onSelect={handleModeType}
                accessibilityLabel="Select number mode"
                testID="modeType-selector"
              />
            </View>

            <View style={styles.scoreTimerRow} accessibilityLiveRegion="polite">
              <Text
                style={[styles.timerText, { color: timerColor }]}
                testID="timer"
              >
                {`\u23F1 ${timeLeft}s`}
              </Text>
              <Text
                style={[styles.scoreText, { color: '#fff' }]}
                testID="score"
              >
                {`Score: ${score}`}
              </Text>
              <Text
                style={[styles.bestScoreText, { color: '#fff' }]}
                testID="best-score"
              >
                {`Best: ${bestScore}`}
              </Text>
              {showPoints && lastPointsEarned !== null && (
                <Text
                  style={[
                    styles.pointsEarned,
                    {
                      color: lastPointsEarned > 0 ? '#4caf50' : '#f44336',
                    },
                  ]}
                  testID="points-earned"
                >
                  {`+${lastPointsEarned}`}
                </Text>
              )}
            </View>
            {showAdaptiveMsg && adaptiveMsgText && (
              <View
                style={styles.adaptiveMsgWrapper}
                accessibilityLiveRegion="polite"
                testID="adaptive-message"
              >
                <Text
                  style={[
                    styles.adaptiveMsgText,
                    {
                      color: adaptiveMsgIsUp ? '#69ff69' : '#ffcc80',
                    },
                  ]}
                >
                  {adaptiveMsgText}
                </Text>
              </View>
            )}
            <View
              style={styles.enemyCount}
              accessibilityLiveRegion="polite"
              accessibilityRole="text"
            >
              <Text style={[styles.enemyCountText, { color: '#fff' }]}>
                {`Enemies: ${numOfEnemies}`}
              </Text>
            </View>
            <View style={styles.soundControls}>
              <BackgroundSound url={bgSound} />
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
                  {soundEnabled ? 'SFX On' : 'SFX Off'}
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
                  {highContrast ? 'High Contrast On' : 'High Contrast Off'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.battlefield}>
            <View style={styles.heroContainer}>
              <View nativeID="hero" accessibilityLabel="Your hero character">
                <Image
                  source={require('./assets/images/hero.png')}
                  style={styles.characterImage}
                  accessibilityLabel="Hero"
                />
              </View>
            </View>
            <View style={styles.enemiesContainer}>
              {[...Array(numOfEnemies)].map((_, i) => (
                <View testID="enemies" key={i}>
                  <Image
                    source={require('./assets/images/orc.png')}
                    style={styles.characterImage}
                    accessibilityLabel={`Enemy ${i + 1}`}
                  />
                </View>
              ))}
            </View>
          </View>
          {won ? (
            <View style={[styles.cardPanel, styles.victoryPanel]}>
              <Text style={styles.victoryText} accessibilityRole="text">
                Victory!
              </Text>
              <Text style={styles.victoryScore} accessibilityRole="text">
                {`Final Score: ${score}`}
              </Text>
              <TouchableOpacity
                onPress={handleRestart}
                style={[
                  styles.restartButton,
                  { backgroundColor: activeTheme.buttonColor },
                ]}
                accessibilityLabel="Play again"
                accessibilityRole="button"
              >
                <Text style={styles.restartButtonText}>Restart</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.mathContainer, styles.cardPanel]}>
              {submitMessageBlock}
              <View style={styles.mathRow}>
                <Text
                  nativeID="val1"
                  style={[styles.mathText, { color: '#fff' }]}
                >
                  {val1 < 0 ? `(${val1})` : val1}
                </Text>
                <Text
                  nativeID="operator"
                  style={[styles.mathText, { color: '#fff' }]}
                >
                  {displayOperator(operator)}
                </Text>
                <Text
                  nativeID="val2"
                  style={[styles.mathText, { color: '#fff' }]}
                >
                  {val2 < 0 ? `(${val2})` : val2}
                </Text>
                <Text style={[styles.mathText, { color: '#fff' }]}>=</Text>
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
              </View>
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
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
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
  pickerContainer: {
    flexDirection: 'column',
    gap: 4,
    width: '100%',
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  difficultyButtonsWrapper: {
    flex: 1,
  },
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
  segmentedButtonDisabled: {
    opacity: 0.4,
  },
  segmentedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '600',
  },
  segmentedButtonTextDisabled: {
    opacity: 0.6,
  },
  adaptiveToggle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginVertical: 4,
  },
  adaptiveToggleActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.35)',
    borderColor: '#4caf50',
  },
  adaptiveToggleText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '600',
  },
  adaptiveToggleTextActive: {
    color: '#fff',
  },
  adaptiveMsgWrapper: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  adaptiveMsgText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: '"Quicksand", sans-serif',
  },
  battlefield: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
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
  characterImage: {
    width: 80,
    height: 160,
    resizeMode: 'contain' as any,
  },
  mathContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
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
  submitRow: {
    alignItems: 'center',
    width: '100%',
  },
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
  victoryPanel: {
    alignItems: 'center',
  },
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
  touchTarget: {
    minHeight: 44,
    justifyContent: 'center',
  },
  msgTextError: {
    color: 'red',
    fontSize: 25,
    fontFamily: '"Quicksand", sans-serif',
  },
  msgTextSuccess: {
    color: 'green',
    fontSize: 25,
    fontFamily: '"Quicksand", sans-serif',
  },
  submitMsgWrapper: {
    paddingBottom: 15,
    fontSize: 40,
    fontFamily: '"Quicksand", sans-serif',
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
  enemyCount: {
    paddingVertical: 4,
  },
  enemyCountText: {
    fontSize: 20,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: 'bold',
  },
  msgTextErrorHC: {
    color: '#ff6b6b',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: '"Quicksand", sans-serif',
  },
  msgTextSuccessHC: {
    color: '#69ff69',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: '"Quicksand", sans-serif',
  },
});

const highContrastStyles = StyleSheet.create({
  input: {
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#000',
    color: '#fff',
  },
  button: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
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
