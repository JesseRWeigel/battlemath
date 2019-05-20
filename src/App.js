import React, { useReducer, useCallback, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Picker
} from 'react-native'
import { reducer, initialState, types } from './AppReducer'
import { useMsgAfterSubmit } from './hooks'

import './App.css'

function App() {
  const [
    { answer, numOfEnemies, val1, val2, won, operator, mode, previousNumOfEnemies },
    dispatch
  ] = useReducer(reducer, initialState)

  let submitInputRef = useRef()

  const variablesToLookFor = [previousNumOfEnemies, numOfEnemies]
  const { msg, isErrorMessage } = useMsgAfterSubmit(variablesToLookFor)

  // useCallback helps prevent re-rendering via memoization
  const handleAnswerChange = useCallback(
    value => {
      dispatch({ type: types.SET_ANSWER, payload: value })
    },
    [dispatch]
  )

  const handleModePicker = useCallback(
    mode => {
      dispatch({
        type: types.SET_MODE,
        payload: mode
      })
    },
    [dispatch]
  )

  const handleRestart = useCallback(() => {
    dispatch({ type: types.RESTART })
  }, [dispatch])

  const handleSubmit = useCallback(() => {
    dispatch({ type: types.CHECK_ANSWER })
    if (submitInputRef.current) submitInputRef.current.focus()
  }, [dispatch])

  const activeTheme = themes[mode]

  // Equivalent of componentDidMount
  useEffect(() => {
    dispatch({ type: types.NEW_PROBLEM })
    if (submitInputRef.current) submitInputRef.current.focus()
  }, [])

  const submitMsgText = isErrorMessage ? styles.msgTextError : styles.msgTextSuccess
  const submitMessageBlock = !!msg && <View style={styles.submitMsgWrapper}><Text style={submitMsgText}>{msg}</Text></View>

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
              { backgroundColor: activeTheme.heroColor }
            ]}
          >
            <svg
              version="1.1"
              id="Layer_1"
              x="0px"
              y="0px"
              viewBox="0 0 488 488"
            >
              <g>
                <path
                  fill="#FF5F64;"
                  d="M326.111,293.143L316,264H172l-10.111,29.143c-3.598,10.371-12.261,18.174-22.951,20.672
		l-45.501,10.633C64.481,331.214,44,357.033,44,386.769V464c0,13.255,10.745,24,24,24h176h176c13.255,0,24-10.745,24-24v-77.231
		c0-29.736-20.481-55.555-49.437-62.321l-45.501-10.633C338.372,311.317,329.709,303.514,326.111,293.143z"
                />
                <path
                  fill="#F04B50;"
                  d="M244,360c54.844,0,106.846-12.769,148.509-36.032l-43.447-10.153
		c-2.223-0.52-4.331-1.318-6.351-2.271C312.875,322.25,279.175,328,244,328s-68.875-5.75-98.71-16.457
		c-2.02,0.954-4.128,1.752-6.351,2.271l-43.447,10.153C137.154,347.231,189.156,360,244,360z"
                />
                <path
                  fill="#464B5F;"
                  d="M244,344c48.517,0,92.445-9.817,124.281-25.694l-19.22-4.491
		c-10.689-2.498-19.353-10.301-22.951-20.672L316,264H172l-10.111,29.143c-3.598,10.371-12.261,18.174-22.951,20.672l-19.22,4.491
		C151.555,334.183,195.483,344,244,344z"
                />
                <path
                  fill="#54596A;"
                  d="M372,144c0,83.947-64.625,160-128,160s-128-76.053-128-160S168.889,0,244,0S372,60.053,372,144z"
                />
                <path
                  fill="#646978;"
                  d="M244,304c63.375,0,128-76.053,128-160H116C116,227.947,180.625,304,244,304z"
                />
                <path
                  fill="#F04B50;"
                  d="M423.746,340.101l-43.856,39.47c-10.114,9.103-15.89,22.071-15.89,35.678V488h56
		c13.255,0,24-10.745,24-24v-77.231C444,368.586,436.316,351.894,423.746,340.101z"
                />
                <path
                  fill="#F04B50;"
                  d="M64.254,340.101l43.856,39.47c10.114,9.103,15.89,22.071,15.89,35.678V488H68
		c-13.255,0-24-10.745-24-24v-77.231C44,368.586,51.684,351.894,64.254,340.101z"
                />
                <path
                  fill="#464B5F;"
                  d="M136.861,144H116c0,20.135,3.797,39.779,10.324,58.065l27.43,5.486L136.861,144z"
                />
                <path
                  fill="#464B5F;"
                  d="M351.139,144H372c0,20.135-3.797,39.779-10.324,58.065l-27.43,5.486L351.139,144z"
                />
                <path
                  fill="#E6D79B;"
                  d="M209.533,218.467l5.78-5.78c3.001-3.001,7.07-4.686,11.314-4.686h34.745
		c4.243,0,8.313,1.686,11.314,4.686l5.78,5.78c3.491,3.491,8.399,5.175,13.298,4.563l30.237-3.78
		c8.946-1.118,16.549-7.12,19.605-15.602C351.068,177.389,355.648,144,355.648,144H132.352c0,0,4.58,33.389,14.041,59.647
		c3.056,8.482,10.659,14.484,19.605,15.602l30.237,3.78C201.134,223.642,206.042,221.958,209.533,218.467z"
                />
              </g>
            </svg>
          </View>
        </View>
        <View style={styles.container}>
          {[...Array(numOfEnemies)].map((_, i) => (
            <View
              className="enemy"
              key={i}
              style={[
                styles.character,
                styles.enemy,
                { backgroundColor: activeTheme.enemyColor }
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
              { backgroundColor: activeTheme.buttonColor }
            ]}
            testID="submit"
            title="Submit"
            onPress={handleSubmit}
            accessibilityLabel="Learn more about this purple button"
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: 16
  },
  title: {
    fontSize: 32,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`
  },
  picker: { height: 60, width: 150 },
  battlefield: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  character: {
    width: 40,
    height: 40
  },
  hero: {
    backgroundColor: 'blue'
  },
  enemy: {
    backgroundColor: 'red'
  },
  mathContainer: {
    paddingVertical: 16
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16
  },
  mathText: {
    fontSize: 40
  },
  input: {
    height: 60,
    width: 60,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 8
  },
  button: {
    height: 60,
    width: 200,
    backgroundColor: '#841584',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 40
  },
  msgTextError: {
    color: 'red',
    fontSize: 25
  }, 
  msgTextSuccess: {
    color: 'green',
    fontSize: 25
  },
  submitMsgWrapper: {
    paddingBottom: 15
  }
})

const themes = {
  addition: {
    backgroundColor: 'rgba(46, 40, 42, 1)',
    heroColor: 'rgba(23, 190, 187, 1)',
    enemyColor: 'rgba(228, 87, 46, 1)',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff'
  },
  subtraction: {
    backgroundColor: 'pink'
  },
  multiplication: {
    backgroundColor: 'yellow'
  },
  division: {
    backgroundColor: 'orange'
  }
}

export default App
