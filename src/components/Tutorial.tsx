import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Translations } from '../i18n';

type TutorialProps = {
  onDismiss: () => void;
  t?: Translations;
};

const DEFAULT_SLIDES = [
  {
    heading: 'Welcome, Warrior!',
    image: 'hero',
    body: ['Defeat the enemies by solving math problems!'],
    buttonLabel: 'Next',
  },
  {
    heading: 'How to Play',
    image: null,
    sample: '7 \u00D7 8 = ?',
    body: [
      'Type the answer and press Submit',
      'Faster answers earn more points!',
    ],
    buttonLabel: 'Next',
  },
  {
    heading: 'Ready?',
    image: 'orc',
    body: [
      'Defeat all enemies to win!',
      "Don't worry \u2014 you get hints if you need them!",
    ],
    buttonLabel: 'Start!',
  },
];

function getSlides(t?: Translations) {
  if (!t) return DEFAULT_SLIDES;
  return [
    {
      heading: t.welcomeTitle,
      image: 'hero',
      body: [t.welcomeText],
      buttonLabel: t.next,
    },
    {
      heading: t.howToPlayTitle,
      image: null,
      sample: '7 \u00D7 8 = ?',
      body: t.howToPlayText,
      buttonLabel: t.next,
    },
    {
      heading: t.readyTitle,
      image: 'orc',
      body: t.readyText,
      buttonLabel: t.start,
    },
  ];
}

export default function Tutorial({ onDismiss, t }: TutorialProps) {
  const SLIDES = getSlides(t);
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;

  const skipLabel = t ? t.skip : 'Skip';

  const handleNext = () => {
    if (isLast) {
      onDismiss();
    } else {
      setSlideIndex(slideIndex + 1);
    }
  };

  return (
    <View style={styles.overlay} testID="tutorial-overlay">
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onDismiss}
        accessibilityLabel={skipLabel}
        accessibilityRole="button"
        testID="tutorial-skip"
      >
        <Text style={styles.skipText}>{skipLabel}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.heading}>{slide.heading}</Text>

        {slide.image === 'hero' && (
          <Image
            source={require('../assets/images/hero.png')}
            style={styles.slideImage}
            accessibilityLabel="Hero character"
          />
        )}
        {slide.image === 'orc' && (
          <Image
            source={require('../assets/images/orc.png')}
            style={styles.slideImage}
            accessibilityLabel="Enemy character"
          />
        )}

        {slide.sample && <Text style={styles.sample}>{slide.sample}</Text>}

        {slide.body.map((line, i) => (
          <Text key={i} style={styles.body}>
            {line}
          </Text>
        ))}

        <TouchableOpacity
          style={[styles.nextButton, isLast && styles.startButton]}
          onPress={handleNext}
          accessibilityLabel={slide.buttonLabel}
          accessibilityRole="button"
          testID="tutorial-next"
        >
          <Text style={styles.nextButtonText}>{slide.buttonLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === slideIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 101,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontFamily: '"Quicksand", sans-serif',
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  slideImage: {
    width: 100,
    height: 200,
    resizeMode: 'contain' as any,
    marginBottom: 16,
  },
  sample: {
    fontSize: 32,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: '700',
    color: '#FFD93D',
    marginBottom: 12,
  },
  body: {
    fontSize: 18,
    fontFamily: '"Quicksand", sans-serif',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 201, 20, 1)',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    paddingHorizontal: 64,
  },
  nextButtonText: {
    fontSize: 22,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700',
    color: '#fff',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
});
