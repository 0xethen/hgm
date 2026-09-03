import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, type SpringOptions } from "motion/react";
import { useIsReducedMotion } from "#/hooks/browser.ts";

const SPRING_CONFIG = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  range?: number;
  actionArea?: "self" | "parent" | "global";
  springOptions?: SpringOptions;
  disabled?: boolean; // reduce motion = enabled automatically
  /** run the effect even when the visitor asks for reduced motion */
  ignoreReducedMotion?: boolean;
};

export function Magnetic({
  children,
  className,
  intensity = 0.6,
  range = 100,
  actionArea = "self",
  springOptions = SPRING_CONFIG,
  disabled = false,
  ignoreReducedMotion = false,
}: MagneticProps) {
  const reducedMotion = useIsReducedMotion();
  const isDisabled = disabled || (reducedMotion && !ignoreReducedMotion);

  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  useEffect(() => {
    if (isDisabled) {
      // snap back to rest if the preference flips mid-session
      x.set(0);
      y.set(0);
      return;
    }

    // only hooked up while actually hovered, so getBoundingClientRect runs once per
    // hover (not on every mousemove across the whole document while nowhere near this element).
    // unhovering (any actionArea) snaps back to rest, same as the isDisabled branch above.
    if (!isHovered) {
      x.set(0);
      y.set(0);
      return;
    }
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const calculateDistance = (e: MouseEvent) => {
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      const absoluteDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (absoluteDistance <= range) {
        const scale = 1 - absoluteDistance / range;
        x.set(distanceX * intensity * scale);
        y.set(distanceY * intensity * scale);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    document.addEventListener("mousemove", calculateDistance);

    return () => {
      document.removeEventListener("mousemove", calculateDistance);
    };
  }, [isHovered, intensity, range, isDisabled]);

  useEffect(() => {
    if (isDisabled) return;

    if (actionArea === "parent" && ref.current?.parentElement) {
      const parent = ref.current.parentElement;

      const handleParentEnter = () => setIsHovered(true);
      const handleParentLeave = () => setIsHovered(false);

      parent.addEventListener("mouseenter", handleParentEnter);
      parent.addEventListener("mouseleave", handleParentLeave);

      return () => {
        parent.removeEventListener("mouseenter", handleParentEnter);
        parent.removeEventListener("mouseleave", handleParentLeave);
      };
    } else if (actionArea === "global") {
      setIsHovered(true);
    }
  }, [actionArea, isDisabled]);

  const handleMouseEnter = () => {
    if (actionArea === "self") {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (actionArea === "self") {
      setIsHovered(false);
    }
  };

  // no motion values, listeners, etc. just a wrapper
  if (isDisabled) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={actionArea === "self" ? handleMouseEnter : undefined}
      onMouseLeave={actionArea === "self" ? handleMouseLeave : undefined}
      style={{
        x: springX,
        y: springY,
      }}
    >
      {children}
    </motion.div>
  );
}
