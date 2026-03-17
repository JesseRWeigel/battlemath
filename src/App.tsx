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
  Button,
  TouchableOpacity,
  // @ts-ignore
  Picker,
  ImageBackground,
  Image,
} from 'react-native';
import { reducer, initialState, TYPES } from './AppReducer';
import { useMsgAfterSubmit } from './hooks';

import HeroSvg from './components/HeroSvg';
import bgSound from './assets/music/background-music.mp3';
import BackgroundSound from './components/BackgroundSound';
import { playCorrectSound, playIncorrectSound } from './utils/SoundEffects';

function displayOperator(op: string): string {
  switch (op) {
    case '+':
      return '+';
    case '-':
      return '\u2212'; // proper minus U+2212
    case '*':
      return '\u00D7'; // multiplication U+00D7
    case '/':
      return '\u00F7'; // division U+00F7
    default:
      return op;
  }
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
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const [timeLeft, setTimeLeft] = useState(30);
  const [showPoints, setShowPoints] = useState(false);
  const pointsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: TYPES.SET_ANSWER, payload: '' });
      }
    },
    [dispatch],
  );

  // useCallback helps prevent re-rendering via memoization
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

  // Equivalent of componentDidMount
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

  // Auto-focus the answer input after each new problem
  useEffect(() => {
    submitInputRef.current && submitInputRef.current.focus();
  }, [val1, val2]);

  // Start timer when a new problem appears
  useEffect(() => {
    if (won) return;
    dispatch({ type: TYPES.START_TIMER });
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [val1, val2, won]);

  // Show points earned animation
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
      style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <Text
          style={[styles.title, { color: activeTheme.textColor }]}
          accessibilityRole="header"
        >
          Battle Math
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={mode}
            onValueChange={handleModePicker}
            nativeID="operation-selector"
            accessibilityLabel="Select math operation"
          >
            <Picker.Item label="Addition (+)" value="addition" />
            <Picker.Item label="Subtraction (−)" value="subtraction" />
            <Picker.Item label="Multiplication (×)" value="multiplication" />
            <Picker.Item label="Division (÷)" value="division" />
          </Picker>

          <Picker
            selectedValue={difficulty}
            style={styles.picker}
            onValueChange={handleDifficultyPicker}
            nativeID="difficulty-selector"
            accessibilityLabel="Select difficulty level"
          >
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>

          <Picker
            selectedValue={modeType}
            style={styles.picker}
            onValueChange={handleModeType}
            nativeID="modeType-selector"
            accessibilityLabel="Select number mode"
          >
            <Picker.Item label="Whole Number" value="wholeNumber" />
            <Picker.Item label="Decimals" value="decimal" />
            <Picker.Item label="Negatives" value="negative" />
          </Picker>
        </View>

        <View style={styles.scoreTimerRow} accessibilityLiveRegion="polite">
          <Text
            style={[styles.timerText, { color: timerColor }]}
            testID="timer"
          >
            {`\u23F1 ${timeLeft}s`}
          </Text>
          <Text
            style={[styles.scoreText, { color: activeTheme.textColor }]}
            testID="score"
          >
            {`Score: ${score}`}
          </Text>
          <Text
            style={[styles.bestScoreText, { color: activeTheme.textColor }]}
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
        <View
          style={styles.enemyCount}
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
        >
          <Text
            style={[styles.enemyCountText, { color: activeTheme.textColor }]}
          >
            {`Enemies: ${numOfEnemies}`}
          </Text>
        </View>
        <View style={styles.battlefield}>
          <View style={styles.container}>
            <View nativeID="hero" accessibilityLabel="Your hero character">
              <Image
                source={require('./assets/images/hero.png')}
                style={{ width: 100, height: 200 }}
                accessibilityLabel="Hero"
              />
            </View>
          </View>
          <View style={styles.container}>
            {[...Array(numOfEnemies)].map((_, i) => (
              <View testID="enemies" key={i}>
                <Image
                  source={require('./assets/images/orc.png')}
                  style={{ width: 100, height: 200 }}
                  accessibilityLabel={`Enemy ${i + 1}`}
                />
              </View>
            ))}
          </View>
        </View>
        {won ? (
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: activeTheme.textColor,
                fontSize: 32,
                fontFamily: '"Fredoka One", "Quicksand", sans-serif',
              }}
              accessibilityRole="text"
            >
              Victory!
            </Text>
            <Text
              style={{
                color: activeTheme.textColor,
                fontSize: 24,
                fontFamily: '"Poppins", sans-serif',
                paddingVertical: 8,
              }}
              accessibilityRole="text"
            >
              {`Final Score: ${score}`}
            </Text>
            <Button
              onPress={handleRestart}
              title="Restart"
              color={activeTheme.buttonColor}
              accessibilityLabel="Play again"
            />
          </View>
        ) : (
          <View style={styles.mathContainer}>
            {submitMessageBlock}
            <View style={styles.mathRow}>
              <Text
                nativeID="val1"
                style={[styles.mathText, { color: activeTheme.textColor }]}
              >
                {val1 < 0 ? `(${val1})` : val1}
              </Text>
              <Text
                nativeID="operator"
                style={[styles.mathText, { color: activeTheme.textColor }]}
              >
                {displayOperator(operator)}
              </Text>
              <Text
                nativeID="val2"
                style={[styles.mathText, { color: activeTheme.textColor }]}
              >
                {val2 < 0 ? `(${val2})` : val2}
              </Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>
                =
              </Text>
              <TextInput
                nativeID="answer-input"
                style={[styles.input, highContrast && highContrastStyles.input]}
                onChangeText={handleAnswerChange}
                onSubmitEditing={handleSubmit}
                onKeyPress={handleKeyDown as any}
                value={answer}
                ref={submitInputRef}
                accessibilityLabel="Enter your answer"
              />
            </View>
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
        )}
        <View style={styles.soundControls}>
          <BackgroundSound url={bgSound} />
          <TouchableOpacity
            onPress={handleSoundToggle}
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
      </ImageBackground>
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
  },
  image: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  picker: {
    height: 40,
    width: 150,
    borderRadius: 8,
    fontFamily: '"Quicksand", sans-serif',
    textAlign: 'center',
    marginLeft: 10,
  },
  battlefield: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  character: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hero: {
    backgroundColor: 'blue',
  },
  enemy: {
    backgroundColor: 'red',
  },
  mathContainer: {
    paddingVertical: 16,
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  mathText: {
    fontSize: 40,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: '700',
  },
  input: {
    height: 60,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 40,
    borderRadius: 8,
    fontFamily: '"Poppins", sans-serif',
  },
  button: {
    height: 60,
    width: 200,
    backgroundColor: '#841584',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 40,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700',
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
  },
  soundToggleText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: '"Quicksand", sans-serif',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreTimerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
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
