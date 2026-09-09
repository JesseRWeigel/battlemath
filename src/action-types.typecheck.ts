// Compile with tsc --noEmit --strict --skipLibCheck --target ES2020
// --moduleResolution node --esModuleInterop src/action-types.typecheck.ts
import { TYPES, type ActionType } from './AppReducer';

const locale: ActionType = { type: TYPES.SET_LOCALE, payload: 'fr' };
// @ts-expect-error A locale string cannot be a challenge problem array.
const invalidChallenge: ActionType = {
  type: TYPES.START_DAILY_CHALLENGE,
  payload: 'fr',
};
// @ts-expect-error Locale selection cannot receive a challenge array.
const invalidLocale: ActionType = { type: TYPES.SET_LOCALE, payload: [] };
// @ts-expect-error Locale selection requires a payload.
const missingLocale: ActionType = { type: TYPES.SET_LOCALE };
// @ts-expect-error Challenge start requires a payload.
const missingChallenge: ActionType = { type: TYPES.START_DAILY_CHALLENGE };
void [locale, invalidChallenge, invalidLocale, missingLocale, missingChallenge];
