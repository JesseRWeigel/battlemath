import { useState, useEffect } from 'react'
import { MESSAGES } from '../utils'

const submitMsgInitiaState = { isErrorMessage: false, msg: '' }

export const useMsgAfterSubmit = (variablesToLookFor, messages = {}) => {
    const [submitMsg, setSubmitMsg] = useState(submitMsgInitiaState)
    const setMsg = (submitMessage, isErrorMessage = false) => {
      setSubmitMsg({ msg: submitMessage, isErrorMessage })
  
      setTimeout(() => setSubmitMsg(submitMsgInitiaState), 1500)
    }
  
    const [previousNumOfEnemies, numOfEnemies] = variablesToLookFor
    const {successMsg = MESSAGES.ANSWER_SUBMIT.SUCCESS, errorMsg = MESSAGES.ANSWER_SUBMIT.ERROR} = messages
  
    useEffect(() => {
      // when after submit the current number of enimies is higher than before
      if (previousNumOfEnemies - numOfEnemies > 0) {
        setMsg(successMsg)
      }
      
      // when after submit the current number of enimies is lower than before
      if (previousNumOfEnemies - numOfEnemies < 0) {
        setMsg(errorMsg, true)
      }
    }, variablesToLookFor)
  
    return submitMsg
  }