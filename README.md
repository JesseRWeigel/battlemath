# BattleMath

BattleMath is a browser-based arithmetic practice game built with React and TypeScript. Players solve problems to battle enemies across four operations:

- Subtraction
- Addition
- Multiplication
- Division

The app includes adaptive difficulty, progressive hints, daily challenges, and progress saved in browser local storage. English, Spanish, and French language resources and PWA configuration are included.

Players can choose difficulties ranging from easy to hard:

| Difficulty | Description |
| --- | --- |
| Easy | Contains digits ranging from 1-9 |
| Medium | Contains digits ranging from 10-99 |
| Hard | Contains digits ranging from 100-999 |

The standard gameplay will consist of whole number answers. Players can also select a **Mode Type** to change the structure of the questions:

| Mode Type | Description |
| --- | --- |
| Whole Number | Standard integers (default) |
| Decimals | Numbers with up to two decimal places |
| Negatives | Introduces negative numbers into problems |

These mode types combine with the difficulty and operator settings, giving children a wide range of practice scenarios.

### Built With

- [React](https://react.dev/) and TypeScript
- Vite and Vitest
- [Cypress](https://www.cypress.io/)
- [Yarn](https://yarnpkg.com/)

## Quick Start

Use Node.js 22.12 or newer and Yarn Classic (1.x). The project uses a Yarn v1 lockfile and enforces Yarn for dependency installation.

```sh
git clone https://github.com/JesseRWeigel/battlemath.git
cd battlemath
yarn install --frozen-lockfile
yarn dev
```

Open [http://localhost:3000/battlemath/](http://localhost:3000/battlemath/) (or the URL printed by Vite if the port is busy).

### Test and build

Run these checks from the repository root, matching the CI workflow:

```sh
yarn format:check
yarn build
yarn test
```

`yarn test` runs Vitest once; `yarn test:watch` starts watch mode. `yarn build` generates the production files in `build/`. To inspect that build locally, run `yarn preview` and open the URL printed by Vite. Building and previewing do not publish the app.

### Scoring System

Each question starts a 30-second countdown timer. Faster correct answers earn more points:

| Speed | Points |
| --- | --- |
| Under 5 seconds | 10 |
| Under 10 seconds | 8 |
| Under 15 seconds | 6 |
| Under 20 seconds | 4 |
| Under 25 seconds | 2 |
| 25 seconds or more | 1 |

Wrong answers earn 0 points. Your total score accumulates across all questions, and your best score for the session is tracked. The timer changes color as time runs low (green to yellow to red) to keep things exciting!

### Roadmap

- [x] Simple UI with Addition, Subtraction, Multiplication, Division questions
- [x] Background music and sound effects
- [x] Deploy to github pages
- [x] Character art for hero and enemies
- [x] Difficulty selection (Easy, Medium, Hard)
- [x] Mode types (Whole Number, Decimals, Negatives)
- [x] Point System

### Untimed practice

On the level-selection screen, enable **Untimed practice** before starting a round.
There is no countdown, and correct answers earn 10 base points regardless of
response time (existing retry and boss multipliers and streak bonuses still apply).
Stars depend on accuracy rather than speed. Level progress, best scores and daily
challenge history are saved separately from timed play in the same browser.
Switch modes between rounds; existing saves remain timed and are not overwritten.
The checkbox has a visible label and explanation and supports keyboard activation.

## Publishing

GitHub Pages deploys automatically from `main` through `.github/workflows/pages.yml`.
Every push to `main` installs locked dependencies, checks formatting, runs tests,
builds the Vite app and deploys the `build` artifact. Failed checks block publishing.
The workflow can also be run manually from Actions on `main`.

Repository Settings > Pages > Source must be **GitHub Actions**. Do not switch
Pages to serve raw files from `main`: this React/Vite app needs its build step.
The former `gh-pages` branch is historical and no longer needs updates. Local
`yarn build` remains available for validation; the old branch-publishing scripts
have been removed to avoid accidentally using the obsolete deployment route.
