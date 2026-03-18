import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Level, LevelProgress, LEVELS, isLevelUnlocked } from '../levels';
import { Translations } from '../i18n';
import {
  getTodayKey,
  getDailyHistory,
  getDailyStreak,
} from '../utils/DailyChallenge';

interface LevelSelectProps {
  progress: Record<number, LevelProgress>;
  onSelectLevel: (level: Level) => void;
  onFreePlay: () => void;
  onDailyChallenge: () => void;
  t?: Translations;
}

const WORLD_COLORS: Record<string, string> = {
  addition: 'rgba(255, 201, 20, 0.85)',
  subtraction: 'rgba(79, 195, 247, 0.85)',
  multiplication: 'rgba(156, 100, 220, 0.85)',
  division: 'rgba(77, 182, 172, 0.85)',
};

const WORLD_HEADER_COLORS: Record<string, string> = {
  addition: '#FFD93D',
  subtraction: '#4FC3F7',
  multiplication: '#9C64DC',
  division: '#4DB6AC',
};

function getWorlds(): { worldName: string; world: string; levels: Level[] }[] {
  const worldMap = new Map<
    string,
    { worldName: string; world: string; levels: Level[] }
  >();
  for (const level of LEVELS) {
    if (!worldMap.has(level.world)) {
      worldMap.set(level.world, {
        worldName: level.worldName,
        world: level.world,
        levels: [],
      });
    }
    worldMap.get(level.world)!.levels.push(level);
  }
  return Array.from(worldMap.values());
}

function StarDisplay({ count }: { count: number }) {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2].map((i) => (
        <Text
          key={i}
          style={[
            styles.starIcon,
            i < count ? styles.starFull : styles.starEmpty,
          ]}
        >
          {i < count ? '\u2605' : '\u2606'}
        </Text>
      ))}
    </View>
  );
}

function DailyChallengeCard({ onPlay }: { onPlay: () => void }) {
  const todayKey = getTodayKey();
  const history = getDailyHistory();
  const todayResult = history[todayKey];
  const streak = getDailyStreak();
  const completedToday = todayResult?.completed ?? false;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.dailyCard}>
      <Text style={styles.dailyTitle}>Daily Challenge</Text>
      <Text style={styles.dailyDate}>{dateStr}</Text>
      {streak > 0 && (
        <Text style={styles.dailyStreak}>
          {'\uD83D\uDD25'} {streak} day streak
        </Text>
      )}
      {completedToday ? (
        <View style={styles.dailyCompleted}>
          <Text style={styles.dailyCompletedText}>Completed {'\u2713'}</Text>
          <Text style={styles.dailyScore}>
            Score: {todayResult.score} | Accuracy: {todayResult.accuracy}%
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.dailyPlayButton}
          onPress={onPlay}
          accessibilityLabel="Play today's daily challenge"
          accessibilityRole="button"
          testID="daily-challenge-button"
        >
          <Text style={styles.dailyPlayText}>Play Today's Challenge</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function LevelSelect({
  progress,
  onSelectLevel,
  onFreePlay,
  onDailyChallenge,
  t,
}: LevelSelectProps) {
  const worlds = getWorlds();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t ? t.selectLevel : 'Select a Level'}</Text>

      <DailyChallengeCard onPlay={onDailyChallenge} />

      {worlds.map((w) => (
        <View key={w.world} style={styles.worldSection}>
          <Text
            style={[
              styles.worldHeader,
              { color: WORLD_HEADER_COLORS[w.world] || '#fff' },
            ]}
          >
            {w.worldName}
          </Text>
          <View style={styles.levelRow}>
            {w.levels.map((level) => {
              const unlocked = isLevelUnlocked(level.id, progress);
              const prog = progress[level.id];
              const completed = prog?.completed ?? false;
              const stars = prog?.stars ?? 0;

              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelButton,
                    unlocked
                      ? {
                          backgroundColor:
                            WORLD_COLORS[level.world] ||
                            'rgba(255,255,255,0.2)',
                        }
                      : styles.levelLocked,
                  ]}
                  onPress={() => unlocked && onSelectLevel(level)}
                  disabled={!unlocked}
                  accessibilityLabel={
                    unlocked
                      ? `${level.label}${level.isBoss ? ' Boss' : ''}${completed ? `, ${stars} stars` : ''}`
                      : `${level.label} locked`
                  }
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !unlocked }}
                  testID={`level-${level.id}`}
                >
                  {unlocked ? (
                    <>
                      <Text style={styles.levelLabel}>
                        {level.isBoss ? '\uD83D\uDC79' : level.id}
                      </Text>
                      <Text style={styles.levelDifficulty}>
                        {level.difficulty}
                      </Text>
                      {completed && <StarDisplay count={stars} />}
                    </>
                  ) : (
                    <>
                      <Text style={styles.lockIcon}>{'\uD83D\uDD12'}</Text>
                      <Text style={styles.levelLabelLocked}>{level.id}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.freePlayButton}
        onPress={onFreePlay}
        accessibilityLabel="Free Play mode"
        accessibilityRole="button"
        testID="free-play-button"
      >
        <Text style={styles.freePlayText}>{t ? t.freePlay : 'Free Play'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 16,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  worldSection: {
    width: '100%',
    marginBottom: 16,
  },
  worldHeader: {
    fontSize: 20,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  levelRow: {
    flexDirection: 'row' as const,
    gap: 10,
    justifyContent: 'center' as const,
    flexWrap: 'wrap' as const,
  },
  levelButton: {
    width: 90,
    height: 100,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 8,
  },
  levelLocked: {
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  levelLabel: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: '"Poppins", sans-serif',
    color: '#fff',
  },
  levelDifficulty: {
    fontSize: 11,
    fontFamily: '"Quicksand", sans-serif',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize' as any,
  },
  levelLabelLocked: {
    fontSize: 14,
    fontFamily: '"Poppins", sans-serif',
    color: 'rgba(255,255,255,0.4)',
  },
  lockIcon: {
    fontSize: 22,
  },
  starsRow: {
    flexDirection: 'row' as const,
    gap: 2,
    marginTop: 2,
  },
  starIcon: {
    fontSize: 14,
  },
  starFull: {
    color: '#FFD93D',
  },
  starEmpty: {
    color: 'rgba(255,255,255,0.4)',
  },
  freePlayButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  freePlayText: {
    fontSize: 20,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700' as const,
    color: '#fff',
  },
  dailyCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 152, 0, 0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center' as const,
  },
  dailyTitle: {
    fontSize: 22,
    fontFamily: '"Fredoka One", "Quicksand", sans-serif',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dailyDate: {
    fontSize: 14,
    fontFamily: '"Quicksand", sans-serif',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  dailyStreak: {
    fontSize: 16,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 4,
  },
  dailyCompleted: {
    marginTop: 8,
    alignItems: 'center' as const,
  },
  dailyCompletedText: {
    fontSize: 18,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  dailyScore: {
    fontSize: 13,
    fontFamily: '"Quicksand", sans-serif',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  dailyPlayButton: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dailyPlayText: {
    fontSize: 18,
    fontFamily: '"Quicksand", sans-serif',
    fontWeight: '700' as const,
    color: '#fff',
  },
});
