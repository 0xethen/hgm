import { cn } from "#/lib/utils";
import { animate, motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import { useIsReducedMotion } from "#/hooks/browser.ts";

export type ScrollerProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
  disabled?: boolean; // reduce motion = enabled automatically
};

export function Scroller({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
  disabled = false,
}: ScrollerProps) {
  const reducedMotion = useIsReducedMotion();
  const isDisabled = disabled || reducedMotion; // TODO: add override (ignore reduce)?

  const [isHovering, setIsHovering] = useState(false);

  const [ref, bounds] = useMeasure();

  const translation = useMotionValue(0);
  const speedMultiplier = useMotionValue(1);

  const size = direction === "horizontal" ? bounds.width : bounds.height;

  const halfSize = (size + gap) / 2;

  const lastTime = useRef<number | null>(null);

  useEffect(() => {
    if (isDisabled || !speedOnHover) return;

    const targetMultiplier = isHovering ? speedOnHover / speed : 1;

    const controls = animate(speedMultiplier, targetMultiplier, {
      duration: 0.5,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [isDisabled, isHovering, speed, speedOnHover, speedMultiplier]);

  useAnimationFrame((time) => {
    if (isDisabled || !halfSize) return;

    if (lastTime.current === null) {
      lastTime.current = time;
      return;
    }

    const delta = (time - lastTime.current) / 1000;
    lastTime.current = time;

    const velocity = speed * speedMultiplier.get() * (reverse ? 1 : -1);

    let next = translation.get() + velocity * delta;

    if (reverse) {
      if (next >= 0) {
        next -= halfSize;
      }
    } else {
      if (next <= -halfSize) {
        next += halfSize;
      }
    }

    translation.set(next);
  });

  // No marquee, and no scrollbar standing in for one: lay the children out so all of them are
  // visible at once. (Callers with a better static layout should branch before rendering a
  // Scroller at all — SponsorSection swaps in its grid.)
  if (isDisabled) {
    return (
      <div className={className}>
        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap, flexDirection: direction === "horizontal" ? "row" : "column" }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{
          ...(direction === "horizontal" ? { x: translation } : { y: translation }),
          gap,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        onHoverStart={speedOnHover ? () => setIsHovering(true) : undefined}
        onHoverEnd={speedOnHover ? () => setIsHovering(false) : undefined}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
