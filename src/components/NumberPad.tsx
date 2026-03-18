import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  showMinus?: boolean;
  showDecimal?: boolean;
  buttonColor?: string;
  compact?: boolean;
}

function NumberPad({
  value,
  onChange,
  onSubmit,
  showMinus = false,
  showDecimal = false,
  buttonColor = 'rgba(255, 201, 20, 1)',
  compact = false,
}: NumberPadProps) {
  const handleDigit = (digit: string) => {
    onChange(value + digit);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleMinus = () => {
    if (value.startsWith('-')) {
      onChange(value.slice(1));
    } else {
      onChange('-' + value);
    }
  };

  const handleDecimal = () => {
    if (!value.includes('.')) {
      onChange(value + '.');
    }
  };

  const needsExtraRow = showMinus || showDecimal;
  const btnStyle = compact
    ? [padStyles.button, padStyles.buttonCompact]
    : [padStyles.button];
  const txtStyle = compact
    ? [padStyles.digitText, padStyles.digitTextCompact]
    : [padStyles.digitText];

  return (
    <View
      style={[padStyles.container, compact && { paddingTop: 2 }]}
      testID="number-pad"
    >
      {/* Row 1 */}
      <View style={padStyles.row}>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('1')}
          activeOpacity={0.7}
          accessibilityLabel="1"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('2')}
          activeOpacity={0.7}
          accessibilityLabel="2"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('3')}
          activeOpacity={0.7}
          accessibilityLabel="3"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>3</Text>
        </TouchableOpacity>
      </View>
      {/* Row 2 */}
      <View style={padStyles.row}>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('4')}
          activeOpacity={0.7}
          accessibilityLabel="4"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('5')}
          activeOpacity={0.7}
          accessibilityLabel="5"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('6')}
          activeOpacity={0.7}
          accessibilityLabel="6"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>6</Text>
        </TouchableOpacity>
      </View>
      {/* Row 3 */}
      <View style={padStyles.row}>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('7')}
          activeOpacity={0.7}
          accessibilityLabel="7"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('8')}
          activeOpacity={0.7}
          accessibilityLabel="8"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={btnStyle}
          onPress={() => handleDigit('9')}
          activeOpacity={0.7}
          accessibilityLabel="9"
          accessibilityRole="button"
        >
          <Text style={padStyles.digitText}>9</Text>
        </TouchableOpacity>
      </View>
      {/* Row 4: varies based on mode */}
      {needsExtraRow ? (
        <>
          <View style={padStyles.row}>
            {showMinus && (
              <TouchableOpacity
                style={btnStyle}
                onPress={handleMinus}
                activeOpacity={0.7}
                accessibilityLabel="Minus sign"
                accessibilityRole="button"
              >
                <Text style={txtStyle}>{'\u2212'}</Text>
              </TouchableOpacity>
            )}
            {showDecimal && (
              <TouchableOpacity
                style={btnStyle}
                onPress={handleDecimal}
                activeOpacity={0.7}
                accessibilityLabel="Decimal point"
                accessibilityRole="button"
              >
                <Text style={txtStyle}>.</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={btnStyle}
              onPress={() => handleDigit('0')}
              activeOpacity={0.7}
              accessibilityLabel="0"
              accessibilityRole="button"
            >
              <Text style={txtStyle}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={btnStyle}
              onPress={handleBackspace}
              activeOpacity={0.7}
              accessibilityLabel="Backspace"
              accessibilityRole="button"
            >
              <Text style={txtStyle}>{'\u2190'}</Text>
            </TouchableOpacity>
          </View>
          <View style={padStyles.row}>
            <TouchableOpacity
              style={[
                padStyles.submitButton,
                compact && padStyles.buttonCompact,
                { backgroundColor: buttonColor },
              ]}
              onPress={onSubmit}
              activeOpacity={0.7}
              accessibilityLabel="Submit answer"
              accessibilityRole="button"
            >
              <Text style={padStyles.submitText}>{'\u2713'} Submit</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={padStyles.row}>
          <TouchableOpacity
            style={btnStyle}
            onPress={handleBackspace}
            activeOpacity={0.7}
            accessibilityLabel="Backspace"
            accessibilityRole="button"
          >
            <Text style={txtStyle}>{'\u2190'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={btnStyle}
            onPress={() => handleDigit('0')}
            activeOpacity={0.7}
            accessibilityLabel="0"
            accessibilityRole="button"
          >
            <Text style={txtStyle}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[...btnStyle, { backgroundColor: buttonColor }]}
            onPress={onSubmit}
            activeOpacity={0.7}
            accessibilityLabel="Submit answer"
            accessibilityRole="button"
          >
            <Text style={txtStyle}>{'\u2713'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const padStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    minWidth: 60,
    minHeight: 60,
    borderRadius: 12,
    margin: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonCompact: {
    minWidth: 48,
    minHeight: 44,
    margin: 2,
    borderRadius: 10,
  },
  digitText: {
    fontSize: 24,
    color: '#fff',
    fontFamily: '"Poppins", sans-serif',
    fontWeight: '600',
  },
  digitTextCompact: {
    fontSize: 20,
  },
  submitButton: {
    minHeight: 60,
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  submitButtonCompact: {
    minHeight: 44,
    margin: 2,
    borderRadius: 10,
  },
  submitText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700',
  },
});

export default NumberPad;
