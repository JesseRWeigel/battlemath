import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from 'react-native';

const FADE_DURATION = 500; // ms
const FADE_STEPS = 20;

export interface BackgroundSoundProps {
  url: string;
}

const BackgroundSound = ({ url }: BackgroundSoundProps) => {
  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevUrlRef = useRef<string>(url);
  const userWantsPlayRef = useRef(false);

  const fadeOut = useCallback((audio: HTMLAudioElement): Promise<void> => {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const step = startVolume / FADE_STEPS;
      const interval = FADE_DURATION / FADE_STEPS;
      const timer = setInterval(() => {
        const next = audio.volume - step;
        if (next <= 0) {
          audio.volume = 0;
          audio.pause();
          clearInterval(timer);
          resolve();
        } else {
          audio.volume = next;
        }
      }, interval);
    });
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement): void => {
    audio.volume = 0;
    const step = 1 / FADE_STEPS;
    const interval = FADE_DURATION / FADE_STEPS;
    const timer = setInterval(() => {
      const next = audio.volume + step;
      if (next >= 1) {
        audio.volume = 1;
        clearInterval(timer);
      } else {
        audio.volume = next;
      }
    }, interval);
  }, []);

  // Handle URL changes — crossfade to new track
  useEffect(() => {
    if (url === prevUrlRef.current) return;
    prevUrlRef.current = url;

    const oldAudio = audioRef.current;
    const wasPlaying = userWantsPlayRef.current;

    // Create new audio element
    const newAudio = new Audio(url);
    newAudio.loop = true;
    audioRef.current = newAudio;

    const switchTrack = async () => {
      if (oldAudio && wasPlaying) {
        await fadeOut(oldAudio);
      } else if (oldAudio) {
        oldAudio.pause();
      }

      setReady(false);

      newAudio.addEventListener(
        'canplaythrough',
        async () => {
          setReady(true);
          if (wasPlaying) {
            try {
              await newAudio.play();
              fadeIn(newAudio);
              setPlaying(true);
            } catch {
              // Browser blocked autoplay
            }
          }
        },
        { once: true },
      );

      newAudio.load();
    };

    switchTrack();

    return () => {
      // Cleanup if component unmounts during transition
    };
  }, [url, fadeOut, fadeIn]);

  // Initial setup — create audio element on mount
  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = true;
    audioRef.current = audio;

    audio.addEventListener(
      'canplaythrough',
      async () => {
        setReady(true);
        try {
          await audio.play();
          setPlaying(true);
          userWantsPlayRef.current = true;
        } catch {
          // Browser blocked autoplay
        }
      },
      { once: true },
    );

    audio.load();

    return () => {
      audio.pause();
      audio.src = '';
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePress = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setPlaying(false);
      userWantsPlayRef.current = false;
      return;
    }

    try {
      await audio.play();
      audio.volume = 1;
      setPlaying(true);
      userWantsPlayRef.current = true;
    } catch {
      // Browser blocked playback
    }
  };

  return (
    <>
      {isReady && (
        <Button
          onPress={handleTogglePress}
          title={isPlaying ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
          accessibilityLabel={
            isPlaying ? 'Pause background music' : 'Play background music'
          }
        />
      )}
    </>
  );
};

export default BackgroundSound;
