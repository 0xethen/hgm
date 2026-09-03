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
  /**
   * lay `children` out as a static grid instead of animating them. unlike swapping in a
   * separate grid element yourself, this keeps the same DOM nodes mounted across the toggle
   * (only their layout classes change), so focus survives a mode switch mid-keyboard-tab
   */
  grid?: boolean;
  gridClassName?: string;
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
  grid = false,
  gridClassName,
}: ScrollerProps) {
  const reducedMotion = useIsReducedMotion();
  const isAnimating = !grid && !disabled && !(reducedMotion && !ignoreReducedMotion);

  const [isHovering, setIsHovering] = useState(false);

  const [ref, bounds] = useMeasure();

  const translation = useMotionValue(0);
  const speedMultiplier = useMotionValue(1);

  const size = direction === "horizontal" ? bounds.width : bounds.height;

  const halfSize = (size + gap) / 2;

  const lastTime = useRef<number | null>(null);

  useEffect(() => {
    if (!isAnimating || !speedOnHover) return;

    const targetMultiplier = isHovering ? speedOnHover / speed : 1;

    const controls = animate(speedMultiplier, targetMultiplier, {
      duration: 0.5,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [isAnimating, isHovering, speed, speedOnHover, speedMultiplier]);

  useAnimationFrame((time) => {
    if (!isAnimating || !halfSize) return;

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

  const rowStyle = {
    gap,
    flexDirection: direction === "horizontal" ? ("row" as const) : ("column" as const),
  };

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className={cn(grid ? cn("grid", gridClassName) : "flex w-max")}
        style={
          isAnimating
            ? { ...(direction === "horizontal" ? { x: translation } : { y: translation }), gap }
            : undefined
        }
        onHoverStart={isAnimating && speedOnHover ? () => setIsHovering(true) : undefined}
        onHoverEnd={isAnimating && speedOnHover ? () => setIsHovering(false) : undefined}
      >
        {/* real, focusable content: always the same nodes, whether laid out as a row or a
            grid, so switching modes (e.g. on keyboard focus) never drops focus mid-tab */}
        <div className={grid ? "contents" : "flex"} style={grid ? undefined : rowStyle}>
          {children}
        </div>

        {/* the seam copy is decoration for the marquee loop: keep it out of the tab order
            and the a11y tree, and drop it entirely outside marquee mode */}
        {isAnimating && (
          <div className="flex" style={rowStyle} aria-hidden inert>
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}
