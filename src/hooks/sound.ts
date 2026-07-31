import { useCallback, useRef } from "react";

const SOUND_FILES = {
  bading: "/assets/sounds/bading.mp3",
} as const;

type SoundName = keyof typeof SOUND_FILES;

export function useSound() {
  const audioRefs = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});

  const play = useCallback((name: SoundName, volume: number = 1) => {
    let audio = audioRefs.current[name];

    if (!audio) {
      audio = new Audio(SOUND_FILES[name]);
      audio.preload = "auto";
      audioRefs.current[name] = audio;
    }

    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  return { play };
}
