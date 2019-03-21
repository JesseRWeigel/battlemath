import React, { useReducer, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Button, Picker } from 'react-native'
import { reducer, initialState, types } from './AppReducer'

import './App.css'

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
    width: 80,
    height: 80
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
    paddingBottom: 8
  },
  mathText: {
    fontSize: 28,
    paddingRight: 8
  },
  input: {
    height: 40,
    width: 60,
    borderColor: 'gray',
    borderWidth: 1
  }
})

const themes = {
  addition: {
    backgroundColor: 'green'
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

function App() {
  const [
    { answer, numOfEnemies, val1, val2, won, operator, mode },
    dispatch
  ] = useReducer(reducer, initialState)

  // useCallback helps prevent rerendering via memoization
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

  const handleSubmit = useCallback(() => {
    dispatch({ type: types.CHECK_ANSWER })
  }, [dispatch])

  const activeTheme = themes[mode]

  // Equivalent of componentDidMount
  useEffect(() => {
    dispatch({ type: types.NEW_PROBLEM })
  }, [])

  return (
    <View
      style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <Text style={styles.title}>Battle Math</Text>
      <Picker
        selectedValue={mode}
        style={styles.picker}
        onValueChange={handleModePicker}
      >
        <Picker.Item label="Additon(+)" value="addition" />
        <Picker.Item label="Subtraction(-)" value="subtraction" />
        <Picker.Item label="Multiplication(*)" value="multiplication" />
        <Picker.Item label="Division(/)" value="division" />
      </Picker>
      <View style={styles.battlefield}>
        <View style={styles.container}>
          <View style={[styles.character, styles.hero]} />
        </View>
        <View style={styles.container}>
          {[...Array(numOfEnemies)].map(i => (
            <View key={i} style={[styles.character, styles.enemy]} />
          ))}
        </View>
      </View>
      {won ? (
        <Text>Victory!</Text>
      ) : (
        <View style={styles.mathContainer}>
          <View style={styles.mathRow}>
            <Text style={styles.mathText}>
              {val1} {operator} {val2} =
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={handleAnswerChange}
              value={answer}
            />
          </View>
          <Button
            onPress={handleSubmit}
            title="Submit"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      )}
    </View>
  )
}

export default App
