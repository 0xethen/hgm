import { cn } from "#/lib/utils";
import { animate, motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

export type ScrollerProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function Scroller({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: ScrollerProps) {
  const [isHovering, setIsHovering] = useState(false);

  const [ref, bounds] = useMeasure();

  const translation = useMotionValue(0);
  const speedMultiplier = useMotionValue(1);

  const size = direction === "horizontal" ? bounds.width : bounds.height;

  const halfSize = (size + gap) / 2;

  const lastTime = useRef<number | null>(null);

  useEffect(() => {
    if (!speedOnHover) return;

    const targetMultiplier = isHovering ? speedOnHover / speed : 1;

    const controls = animate(speedMultiplier, targetMultiplier, {
      duration: 0.5,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [isHovering, speed, speedOnHover, speedMultiplier]);

  useAnimationFrame((time) => {
    if (!halfSize) return;

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
