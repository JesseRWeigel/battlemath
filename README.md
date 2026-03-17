# BattleMath

A simple browser based game that helps children learn the four basic fundamentals of math

- Subtraction
- Addition
- Multiplication
- Division

Children will be tested on their skills with added difficulties and decimals. 
The game will consists of difficulties ranging from easy to hard

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

- [React](https://reactjs.org/)
- [Cypress](https://www.cypress.io/)
- [Yarn](https://yarnpkg.com/)

## Quick Start

```sh
git clone git@github.com:JesseRWeigel/battlemath.git
```

```sh
cd battlemath

yarn install

yarn start
```

### Publish

```sh
npm run build
```

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
