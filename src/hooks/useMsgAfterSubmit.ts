import { useState, useEffect } from 'react';
import { getRandomSuccessMessage } from '../utils';

const submitMsgInitiaState = { isErrorMessage: false, msg: '' };

export const useMsgAfterSubmit = (
  variablesToLookFor: [number, number],
  isStoredState: boolean,
) => {
  const [submitMsg, setSubmitMsg] = useState(submitMsgInitiaState);
  const setMsg = (submitMessage: string, isErrorMessage = false) => {
    setSubmitMsg({ msg: submitMessage, isErrorMessage });
    setTimeout(() => setSubmitMsg(submitMsgInitiaState), 1500);
  };

  const [previousNumOfEnemies, numOfEnemies] = variablesToLookFor;

  useEffect(() => {
    if (!isStoredState) {
      if (previousNumOfEnemies - numOfEnemies > 0) {
        setMsg(getRandomSuccessMessage());
      }
    }
  }, variablesToLookFor);

  return submitMsg;
};
