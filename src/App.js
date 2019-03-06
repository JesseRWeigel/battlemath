import React, { Component } from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import './App.css'

class App extends Component {
  state = {
    text: ''
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
            <View style={styles.enemy} />
            <View style={styles.enemy} />
            <View style={styles.enemy} />
          </View>
        </View>
        <View style={styles.mathContainer}>
          <View style={styles.mathRow}>
            <Text style={styles.mathText}>2 + 2 =</Text>
            <TextInput
              style={styles.input}
              onChangeText={text => this.setState({ text })}
              value={this.state.text}
            />
          </View>
          <Button
            onPress={() => console.log(this.state.text)}
            title="Submit"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
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
