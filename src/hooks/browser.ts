import * as Svelte from "react";

const BREAKPOINTS = {
  xs: 380,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.xxl) return "xxl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = Svelte.useState<Breakpoint>("sm");
  const [isMobileDevice, setIsMobileDevice] = Svelte.useState<boolean>(false);

  Svelte.useEffect(() => {
    setIsMobileDevice(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    );
  }, []);

  Svelte.useEffect(() => {
    const update = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    breakpoint,

    xs: true,
    sm: breakpoint !== "xs",
    md: breakpoint === "md" || breakpoint === "lg" || breakpoint === "xl" || breakpoint === "xxl",
    lg: breakpoint === "lg" || breakpoint === "xl" || breakpoint === "xxl",
    xl: breakpoint === "xl" || breakpoint === "xxl",
    xxl: breakpoint === "xxl",

    /** @deprecated Use the sm breakpoint instead */
    isMobile: breakpoint === "sm",
    isMobileDevice,
  };
}

export function useIsReducedMotion() {
  const [isReducedMotion, setIsReducedMotion] = Svelte.useState<boolean | undefined>(undefined);

  Svelte.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setIsReducedMotion(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsReducedMotion(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isReducedMotion;
}

export function useIsHighContrast() {
  const [isHighContrast, setIsHighContrast] = Svelte.useState<boolean | undefined>(undefined);

  Svelte.useEffect(() => {
    const mql = window.matchMedia("(prefers-contrast: more)");
    const onChange = () => {
      setIsHighContrast(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsHighContrast(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isHighContrast;
}
