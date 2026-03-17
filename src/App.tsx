import React, { useReducer, useCallback, useEffect } from 'react';
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
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  let submitInputRef = React.useRef<TextInput>(null);

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

  const activeTheme = themes[mode];

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
    ? styles.msgTextError
    : styles.msgTextSuccess;
  const submitMessageBlock = !!msg && (
    <View style={styles.submitMsgWrapper}>
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  );

  useEffect(() => {
    submitInputRef.current && submitInputRef.current.focus();
  });

  return (
    <View
      style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <Text style={[styles.title, { color: activeTheme.textColor }]}>
          Battle Math
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={mode}
            onValueChange={handleModePicker}
            nativeID="operation-selector"
          >
            <Picker.Item label="Addition(+)" value="addition" />
            <Picker.Item label="Subtraction(-)" value="subtraction" />
            <Picker.Item label="Multiplication(*)" value="multiplication" />
            <Picker.Item label="Division(/)" value="division" />
          </Picker>

          <Picker
            selectedValue={difficulty}
            style={styles.picker}
            onValueChange={handleDifficultyPicker}
            nativeID="difficulty-selector"
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
          >
            <Picker.Item label="Whole Number" value="wholeNumber" />
            <Picker.Item label="Decimals" value="decimal" />
            <Picker.Item label="Negatives" value="negative" />
          </Picker>
        </View>

        <View style={styles.battlefield}>
          <View style={styles.container}>
            <View nativeID="hero">
              <Image
                source={require('./assets/images/hero.png')}
                style={{ width: 100, height: 200 }}
              />
            </View>
          </View>
          <View style={styles.container}>
            {[...Array(numOfEnemies)].map((_, i) => (
              <View testID="enemies" key={i}>
                <Image
                  source={require('./assets/images/orc.png')}
                  style={{ width: 100, height: 200 }}
                />
              </View>
            ))}
          </View>
        </View>
        {won ? (
          <View>
            <Text style={{ color: activeTheme.textColor }}>Victory!</Text>
            <Button
              onPress={handleRestart}
              title="Restart"
              color={activeTheme.buttonColor}
              accessibilityLabel="Click this button to play again."
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
                {operator}
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
                style={styles.input}
                onChangeText={handleAnswerChange}
                onSubmitEditing={handleSubmit}
                value={answer}
                ref={submitInputRef}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: activeTheme.buttonColor },
              ]}
              testID="submit"
              onPress={handleSubmit}
              accessibilityLabel="Learn more about this purple button"
            >
              <Text style={styles.buttonText}>Submit</Text>
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
            testID="sound-toggle"
          >
            <Text style={styles.soundToggleText}>
              {soundEnabled ? 'SFX On' : 'SFX Off'}
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
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  picker: {
    height: 40,
    width: 150,
    borderRadius: 8,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
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
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
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
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
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
  },
  msgTextError: {
    color: 'red',
    fontSize: 25,
  },
  msgTextSuccess: {
    color: 'green',
    fontSize: 25,
  },
  submitMsgWrapper: {
    paddingBottom: 15,
    fontSize: 40,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
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
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

const themes = {
  addition: {
    backgroundColor: 'darkslateblue',
    heroColor: 'rgba(23, 190, 187, 1)',
    enemyColor: 'rgba(228, 87, 46, 1)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  subtraction: {
    backgroundColor: 'deepskyblue',
    heroColor: 'rgba(23, 190, 187, 1)',
    enemyColor: 'rgba(228, 87, 46, 1)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#000',
  },
  multiplication: {
    backgroundColor: 'darkslategrey',
    heroColor: 'rgba(23, 190, 187, 1)',
    enemyColor: 'rgba(228, 87, 46, 1)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  division: {
    backgroundColor: 'turquoise',
    heroColor: 'rgba(23, 190, 187, 1)',
    enemyColor: 'rgba(228, 87, 46, 1)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#000',
  },
};

export default App;
