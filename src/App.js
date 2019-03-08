import React, { Component } from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import './App.css'

class App extends Component {
  state = {
    answer: '',
    numOfEnemies: 3,
    val1: 0,
    val2: 0,
    won: false
  }

  componentDidMount() {
    this.newProblem()
  }

  randomNum = max => Math.floor(Math.random() * Math.floor(max))

  checkAnswer = () => {
    let correct =
      parseInt(this.state.answer, 10) === this.state.val1 + this.state.val2
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
    return (
      <View style={styles.root}>
        <Text>Battle Math</Text>
        <View style={styles.battlefield}>
          <View style={styles.container}>
            <View style={styles.hero} />
          </View>
          <View style={styles.container}>
            {[...Array(this.state.numOfEnemies)].map(i => (
              <View key={i} style={styles.enemy} />
            ))}
          </View>
        </View>
        {this.state.won ? (
          <Text>Victory!</Text>
        ) : (
          <View style={styles.mathContainer}>
            <View style={styles.mathRow}>
              <Text style={styles.mathText}>
                {this.state.val1} + {this.state.val2} =
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={answer => this.setState({ answer })}
                value={this.state.answer}
              />
            </View>
            <Button
              onPress={() => this.checkAnswer()}
              title="Submit"
              color="#841584"
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
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
  hero: {
    width: 40,
    height: 40,
    backgroundColor: 'blue'
  },
  enemy: {
    width: 40,
    height: 40,
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
    fontSize: 26,
    paddingRight: 8
  },
  input: {
    height: 40,
    width: 60,
    borderColor: 'gray',
    borderWidth: 1
  }
})

export default App
