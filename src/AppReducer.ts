import { Reducer } from 'react'

export function randomNumberGenerator(min = 0, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const TYPES = {
  SET_ANSWER: 0,
  ADD_ENEMY: 1,
  REMOVE_ENEMY: 2,
  CHECK_ANSWER: 3,
  NEW_PROBLEM: 4,
  SET_MODE: 5,
  RESTART: 6,
  RESTORE_STATE: 7,
} as const

const OPERATORS = {
  addition: '+',
  subtraction: '-',
  multiplication: '*',
  division: '/',
} as const

export type ActionType = {
  type: typeof TYPES[keyof typeof TYPES]
  payload?: unknown
}

export type AppState = {
  answer: string
  numOfEnemies: number
  previousNumOfEnemies: number
  val1: number
  val2: number
  won: boolean
  operator: typeof OPERATORS[keyof typeof OPERATORS]
  mode: keyof typeof OPERATORS
  isStoredState: boolean
}

export const initialState: AppState = {
  answer: '',
  numOfEnemies: 3,
  previousNumOfEnemies: 3,
  val1: 0,
  val2: 0,
  won: false,
  operator: '+',
  mode: 'addition',
  isStoredState: true,
}

export const reducer: Reducer<AppState, ActionType> = (state, action) => {
  const randomNumber = () => {
    let val1, val2
    let x = 1,
      y = 9

    val1 = randomNumberGenerator(x, y)

    switch (state.mode) {
      case 'division': {
        y = Math.floor(y / val1) // keeps x *= y below 10
        break
      }
      case 'subtraction': {
        y = val1
        break
      }
    }

    val2 = randomNumberGenerator(x, y)

    return [val1, val2]
  }

  switch (action.type) {
    case TYPES.RESTART: {
      let val = randomNumber()

      switch (state.mode) {
        case 'division': {
          state.operator = '/'
          break
        }
        case 'subtraction': {
          state.operator = '-'
          break
        }
        case 'addition': {
          state.operator = '+'
          break
        }
        case 'multiplication': {
          state.operator = '*'
          break
        }
      }

      return {
        ...initialState,
        mode: state.mode,
        val1: val[0],
        val2: val[1],
        operator: state.operator,
      }
    }

    case TYPES.SET_ANSWER: {
      return {
        ...state,
        isStoredState: false,
        answer: action.payload as string,
      }
    }

    case TYPES.ADD_ENEMY: {
      if (state.numOfEnemies < 6) {
        return {
          ...state,
          previousNumOfEnemies: state.numOfEnemies,
          numOfEnemies: state.numOfEnemies + 1,
        }
      }
      break
    }

    case TYPES.REMOVE_ENEMY: {
      const newState = { ...state, previousNumOfEnemies: state.numOfEnemies }
      newState.numOfEnemies--

      if (newState.numOfEnemies === 0) {
        newState.won = true
      }

      return newState
    }

    case TYPES.CHECK_ANSWER: {
      const answer = parseInt(state?.answer ?? '', 10)
      // example: eval('2 + 4'); Note: eval is safe here because we control the input
      // eslint-disable-next-line no-eval
      const expected = eval(`${state.val1} ${state.operator} ${state.val2}`)

      // Update enemies & won
      const stateWithEnemies =
        answer === expected
          ? reducer(state, { type: TYPES.REMOVE_ENEMY })
          : reducer(state, { type: TYPES.ADD_ENEMY })

      // Update problem
      return reducer(stateWithEnemies, { type: TYPES.NEW_PROBLEM })
    }

    case TYPES.NEW_PROBLEM: {
      let val = randomNumber()

      if (state.mode === 'division') val[0] *= val[1] // divide by `y` to get back `x`

      // if problem is the same, retry
      if (val[0] === state.val1 && val[1] === state.val2) {
        return reducer(state, { type: TYPES.NEW_PROBLEM })
      }

      return {
        ...state,
        val1: val[0],
        val2: val[1],
        answer: '',
      }
    }

    case TYPES.SET_MODE: {
      const mode = action.payload as keyof typeof OPERATORS
      let val = randomNumber()
      return {
        ...state,
        mode,
        val1: val[0],
        val2: val[1],
        operator: OPERATORS[mode],
      }
    }

    case TYPES.RESTORE_STATE: {
      const storedState = action.payload as AppState
      return { ...storedState, isStoredState: true }
    }

    default:
      throw new Error(`Invalid action ${action.type}`)
  }

  return state
}
