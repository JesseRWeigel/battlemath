import React, { useReducer, useCallback, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  // @ts-ignore
  Picker,
} from 'react-native'
import { reducer, initialState, TYPES } from './AppReducer'
import { useMsgAfterSubmit } from './hooks'

import HeroSvg from './components/HeroSvg'
import bgSound from './assets/music/background-music.mp3'
import BackgroundSound from './components/BackgroundSound'

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
      previousNumOfEnemies,
      isStoredState,
    },
    dispatch,
  ] = useReducer(reducer, initialState)

  let submitInputRef = React.useRef<TextInput>(null)

  const variablesToLookFor: [number, number] = [
    previousNumOfEnemies,
    numOfEnemies,
  ]
  const { msg, isErrorMessage } = useMsgAfterSubmit(
    variablesToLookFor,
    isStoredState
  )

  // useCallback helps prevent re-rendering via memoization
  const handleAnswerChange = useCallback(
    (value: string) => {
      if (/^\d+$/.test(value.toString()) || value === '') {
        dispatch({ type: TYPES.SET_ANSWER, payload: value })
      }
    },
    [dispatch]
  )

  const handleModePicker = useCallback(
    (mode: string) => {
      dispatch({
        type: TYPES.SET_MODE,
        payload: mode,
      })
    },
    [dispatch]
  )

  const handleRestart = useCallback(() => {
    dispatch({ type: TYPES.RESTART })
  }, [dispatch])

  const handleSubmit = useCallback(() => {
    dispatch({ type: TYPES.CHECK_ANSWER })
    if (submitInputRef.current) submitInputRef.current.focus()
  }, [dispatch])

  const activeTheme = themes[mode]

  // Equivalent of componentDidMount
  useEffect(() => {
    dispatch({ type: TYPES.NEW_PROBLEM })
    const storedData = localStorage.getItem('state')
    if (storedData) {
      dispatch({ type: TYPES.RESTORE_STATE, payload: JSON.parse(storedData) })
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
          previousNumOfEnemies,
        })
      )
    }
  }, [])

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
        previousNumOfEnemies,
      })
    )
  }, [
    answer,
    numOfEnemies,
    won,
    val1,
    val2,
    operator,
    mode,
    previousNumOfEnemies,
  ])

  const submitMsgText = isErrorMessage
    ? styles.msgTextError
    : styles.msgTextSuccess
  const submitMessageBlock = !!msg && (
    <View style={styles.submitMsgWrapper}>
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  )

  useEffect(() => {
    submitInputRef.current && submitInputRef.current.focus()
  })

  return (
    <View
      style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <Text style={[styles.title, { color: activeTheme.textColor }]}>
        Battle Math
      </Text>
      <Picker
        selectedValue={mode}
        style={styles.picker}
        onValueChange={handleModePicker}
        nativeID="operation-selector"
      >
        <Picker.Item label="Addition(+)" value="addition" />
        <Picker.Item label="Subtraction(-)" value="subtraction" />
        <Picker.Item label="Multiplication(*)" value="multiplication" />
        <Picker.Item label="Division(/)" value="division" />
      </Picker>

      <View style={styles.battlefield}>
        <View style={styles.container}>
          <View
            nativeID="hero"
            style={[
              styles.character,
              styles.hero,
              { backgroundColor: activeTheme.heroColor },
            ]}
          >
            <HeroSvg />
          </View>
        </View>
        <View style={styles.container}>
          {[...Array(numOfEnemies)].map((_, i) => (
            <View
              testID="enemies"
              key={i}
              style={[
                styles.character,
                styles.enemy,
                { backgroundColor: activeTheme.enemyColor },
              ]}
            />
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
              {val1}
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
              {val2}
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
      <BackgroundSound url={bgSound} />
    </View>
  )
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
  },
  picker: {
    height: 60,
    width: 150,
    borderRadius: 8,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
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
    width: 60,
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
})

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
}

export default App
