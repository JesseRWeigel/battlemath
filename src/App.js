import React, { useReducer, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Button, Picker } from 'react-native'
import './App.css'

/* class App extends Component {
  state = {
    answer: '',
    numOfEnemies: 3,
    val1: 0,
    val2: 0,
    won: false,
    operator: '+',
    mode: 'addition'
  }

  componentDidMount() {
    this.newProblem()
  }

  handleSubmit = () => {
    this.checkAnswer(this.state.mode)
  }

  handleModePicker = val => {
    switch (val) {
      case 'addition':
        this.setState({ mode: val, operator: '+' })
        break
      case 'subtraction':
        this.setState({ mode: val, operator: '-' })
        break
      case 'multiplication':
        this.setState({ mode: val, operator: '*' })
        break
      case 'division':
        this.setState({ mode: val, operator: '/' })
        break
      default:
        console.log('not an option')
    }
  }

  randomNum = max => Math.floor(Math.random() * Math.floor(max))

  checkAnswer = operator => {
    let correct
    switch (operator) {
      case 'addition':
        correct =
          parseInt(this.state.answer, 10) === this.state.val1 + this.state.val2
        this.setState({ operator: '+' })
        break
      case 'subtraction':
        correct =
          parseInt(this.state.answer, 10) === this.state.val1 - this.state.val2
        this.setState({ operator: '-' })
        break
      case 'multiplication':
        correct =
          parseInt(this.state.answer, 10) === this.state.val1 * this.state.val2
        this.setState({ operator: '*' })
        break
      case 'division':
        correct =
          parseInt(this.state.answer, 10) === this.state.val1 / this.state.val2
        this.setState({ operator: '/' })
        break
      default:
        console.log('not an option')
    }

    if (correct) {
      this.removeEnemy()
    } else {
      this.addEnemy()
    }
    this.newProblem()
  }

  removeEnemy = () => {
    this.setState(
      prev => ({ numOfEnemies: prev.numOfEnemies - 1 }),
      () => {
        if (this.state.numOfEnemies === 0) {
          this.youWon()
        }
      }
    )
  }

  addEnemy = () => {
    if (this.state.numOfEnemies < 6) {
      this.setState({ numOfEnemies: this.state.numOfEnemies + 1 })
    }
  }

  newProblem = () => {
    this.setState({ val1: this.randomNum(10), val2: this.randomNum(10) })
  }

  youWon = () => {
    this.setState({ won: true })
  }

  render() {
    const { mode, answer, numOfEnemies, val1, val2, won, operator } = this.state
    const activeTheme = themes[mode]
    return (
      <View
        style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}
      >
        <Text style={styles.title}>Battle Math</Text>
        <Picker
          selectedValue={mode}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) =>
            this.handleModePicker(itemValue)
          }
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
                onChangeText={answer => this.setState({ answer })}
                value={answer}
              />
            </View>
            <Button
              onPress={() => this.handleSubmit()}
              title="Submit"
              color="#841584"
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
        )}
      </View>
    )
  }
} */

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

function randomNumberGenerator(min = 0, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const types = {
  SET_ANSWER: 0,
  ADD_ENEMY: 1,
  REMOVE_ENEMY: 2,
  CHECK_ANSWER: 3,
  NEW_PROBLEM: 4,
  SET_MODE: 5
}

function reducer(state, action) {
  switch (action.type) {
    case types.SET_ANSWER:
      return {
        ...state,
        answer: action.payload
      }

    case types.ADD_ENEMY:
      if (state.numOfEnemies < 6) {
        return {
          ...state,
          numOfEnemies: state.numOfEnemies + 1
        }
      }
      break

    case types.REMOVE_ENEMY:
      const newState = { ...state }
      newState.numOfEnemies--

      if (newState.numOfEnemies === 0) {
        newState.won = true
      }

      return newState

    case types.CHECK_ANSWER:
      const answer = parseInt(state.answer, 10)
      // example: eval('2 + 4')
      const expected = eval(`${state.val1} ${state.operator} ${state.val2}`)

      // Update enemies & won
      const stateWithEnemies =
        answer === expected
          ? reducer(state, { type: types.REMOVE_ENEMY })
          : reducer(state, { type: types.ADD_ENEMY })

      // Update problem
      return reducer(stateWithEnemies, { type: types.NEW_PROBLEM })

    case types.NEW_PROBLEM:
      return {
        ...state,
        val1: randomNumberGenerator(0, 9),
        val2: randomNumberGenerator(0, 9)
      }

    case types.SET_MODE:
      const { mode, operator } = action.payload
      return {
        ...state,
        mode,
        operator
      }

    default:
      throw new Error(`Invalid action ${action.type}`)
  }

  return state
}

const initialState = {
  answer: '',
  numOfEnemies: 3,
  val1: 0,
  val2: 0,
  won: false,
  operator: '+',
  mode: 'addition'
}

const operatorsByMode = {
  addition: '+',
  subtraction: '-',
  multiplication: '*',
  division: '/'
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
      const operator = operatorsByMode[mode]
      dispatch({
        type: types.SET_MODE,
        payload: { mode, operator }
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
