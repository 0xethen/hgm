import { type JSX, useEffect, useState, useRef, useMemo } from "react";
import { motion, type MotionProps } from "motion/react";

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  trigger?: boolean;
  deTriggerStopsScramble?: boolean;
  onScrambleComplete?: () => void;
} & MotionProps;

const defaultChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = "span",
  trigger = true,
  deTriggerStopsScramble = false,
  onScrambleComplete,
  ...props
}: TextScrambleProps) {
  // THE FIX: Memoize the component so it doesn't unmount on every animation frame
  const MotionComponent = useMemo(
    () => motion.create(Component as keyof JSX.IntrinsicElements),
    [Component],
  );

  const [scrambledText, setScrambledText] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const text = children;
  const displayText = scrambledText ?? children;

  const stopAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScrambledText(null);
    setIsAnimating(false);
  };

  const scramble = async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const steps = duration / speed;
    let step = 0;

    // Safety catch: clear any rogue intervals before starting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      let scrambled = "";
      const progress = step / steps;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          scrambled += " ";
          continue;
        }

        if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }

      setScrambledText(scrambled);
      step++;

      if (step > steps) {
        stopAnimation();
        onScrambleComplete?.();
      }
    }, speed * 1000);
  };

  useEffect(() => {
    if (trigger) {
      void scramble();
    } else if (deTriggerStopsScramble) {
      stopAnimation();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, deTriggerStopsScramble]);

  return (
    <MotionComponent className={className} {...props}>
      {displayText}
    </MotionComponent>
  );
}
