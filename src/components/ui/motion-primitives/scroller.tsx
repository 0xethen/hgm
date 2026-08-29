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
  /** keep the marquee running even when the visitor asks for reduced motion */
  ignoreReducedMotion?: boolean;
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
  ignoreReducedMotion = false,
}: ScrollerProps) {
  const reducedMotion = useIsReducedMotion();
  const isDisabled = disabled || (reducedMotion && !ignoreReducedMotion);

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

  const rowStyle = {
    gap,
    flexDirection: direction === "horizontal" ? ("row" as const) : ("column" as const),
  };

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
        <div className="flex" style={rowStyle}>
          {children}
        </div>
        {/* the seam copy is decoration: keep it out of the tab order and the a11y tree */}
        <div className="flex" style={rowStyle} aria-hidden inert>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
