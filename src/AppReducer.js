export function randomNumberGenerator(min = 0, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const types = {
  SET_ANSWER: 0,
  ADD_ENEMY: 1,
  REMOVE_ENEMY: 2,
  CHECK_ANSWER: 3,
  NEW_PROBLEM: 4,
  SET_MODE: 5
}

export function reducer(state, action) {
  switch (action.type) {
    case types.RESTART: {
      const restartState = { ...initialState }
      restartState.mode = state.mode
      restartState.operator = state.operator

      return reducer(restartState, { type: types.NEW_PROBLEM })
    }

    case types.SET_ANSWER: {
      return {
        ...state,
        answer: action.payload
      }
    }

    case types.ADD_ENEMY: {
      if (state.numOfEnemies < 6) {
        return {
          ...state,
          numOfEnemies: state.numOfEnemies + 1
        }
      }
      break
    }

    case types.REMOVE_ENEMY: {
      const newState = { ...state }
      newState.numOfEnemies--

      if (newState.numOfEnemies === 0) {
        newState.won = true
      }

      return newState
    }

    case types.CHECK_ANSWER: {
      let answer = parseInt(state.answer, 10)
      // example: eval('2 + 4'); Note: eval is safe here because we control the input
      // eslint-disable-next-line no-eval
      let expected = eval(`${state.val1} ${state.operator} ${state.val2}`)

      // Update enemies & won
      const stateWithEnemies =
        answer === expected
          ? reducer(state, { type: types.REMOVE_ENEMY })
          : reducer(state, { type: types.ADD_ENEMY })

      // Update problem
      return reducer(stateWithEnemies, { type: types.NEW_PROBLEM })
    }

    case types.NEW_PROBLEM: {
      let x
      let y

      switch (state.mode) {
        case 'division': {
          x = randomNumberGenerator(1, 9)
          y = randomNumberGenerator(1, Math.floor(9 / x)) // keeps x *= y below 10
          x *= y // divide by `y` to get back `x`
          break
        }

        case 'subtraction': {
          x = randomNumberGenerator(1, 9)
          y = randomNumberGenerator(1, x)
          break
        }

        default:
          x = randomNumberGenerator(1, 9)
          y = randomNumberGenerator(1, 9)
      }

      // if problem is the same, retry
      if (x === state.val1 && y === state.val2) {
        return reducer(state, { type: types.NEW_PROBLEM })
      }

      return {
        ...state,
        val1: x,
        val2: y,
        answer: ''
      }
    }

    case types.SET_MODE: {
      const mode = action.payload
      return reducer(
        {
          ...state,
          mode,
          operator: operatorsByMode[mode]
        },
        { type: types.NEW_PROBLEM }
      )
    }

    default:
      throw new Error(`Invalid action ${action.type}`)
  }

  return state
}

export const initialState = {
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
