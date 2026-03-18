// AI-generated sound effects with Web Audio API fallback
import correctSfx from '../assets/sounds/correct.mp3';
import wrongSfx from '../assets/sounds/wrong.mp3';
import enemyDefeatSfx from '../assets/sounds/enemy_defeat.mp3';
import streakMilestoneSfx from '../assets/sounds/streak_milestone.mp3';
import victoryFanfareSfx from '../assets/sounds/victory_fanfare.mp3';
import starEarnedSfx from '../assets/sounds/star_earned.mp3';

const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache[src]) {
    audioCache[src] = new Audio(src);
  }
  return audioCache[src];
}

function playSound(src: string): void {
  try {
    const audio = getAudio(src);
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser may block autoplay before user interaction
    });
  } catch {
    // Silently fail if audio not available
  }
}

export function playCorrectSound(): void {
  playSound(correctSfx);
}

export function playIncorrectSound(): void {
  playSound(wrongSfx);
}

export function playEnemyDefeatSound(): void {
  playSound(enemyDefeatSfx);
}

export function playStreakMilestoneSound(): void {
  playSound(streakMilestoneSfx);
}

export function playVictoryFanfare(): void {
  playSound(victoryFanfareSfx);
}

export function playStarEarnedSound(): void {
  playSound(starEarnedSfx);
}

// Preload all sounds
Object.values([
  correctSfx,
  wrongSfx,
  enemyDefeatSfx,
  streakMilestoneSfx,
  victoryFanfareSfx,
  starEarnedSfx,
]).forEach(getAudio);
