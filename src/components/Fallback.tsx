import * as React from "react";
import { Link } from "@tanstack/react-router";

import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
import { useBreakpoint, useIsReducedMotion } from "#/hooks/browser.ts";
import { cn } from "#/lib/utils";

export type FallbackTone = "default" | "destructive" | "secret";

export interface FallbackAction {
  label: React.ReactNode;
  tone?: FallbackTone;
  hidden?: boolean;
  to?: string;
  search?: Record<string, unknown>;
  params?: Record<string, unknown>;
  ref?: React.Ref<any>;
  onClick?: React.MouseEventHandler<any>;
  onKeyDown?: React.KeyboardEventHandler<any>;
  onBlur?: React.FocusEventHandler<any>;
}

const TONE_CLASS: Record<FallbackTone, string> = {
  default:
    "transition-transform not-motion-reduce:hover:-translate-y-px focus-visible:decoration-foreground/50 focus-visible:hover:decoration-foreground",
  destructive:
    "not-motion-reduce:hover:animate-shake-once hocus:text-destructive focus-visible:decoration-destructive/50 focus-visible:hover:decoration-destructive",
  secret:
    "hocus:text-green-500 focus-visible:decoration-green-500/50 focus-visible:hover:decoration-green-500",
};

const FIRST_DELAY = 600;
const DELAY_STEP = 300;

export function FallbackActionLabel({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span
      className={cn("font-bold", delay !== undefined && "animate-in fade-in fill-mode-backwards")}
      style={delay === undefined ? undefined : { animationDelay: `${delay}ms` }}
    >
      <span className="hidden group-focus:inline mr-1.5">{">"}</span>
      <span className="group-hocus:underline">{children}</span>
      <span className="hidden group-focus:inline ml-1.5">{"<"}</span>
    </span>
  );
}

function FallbackActionItem({
  action,
  index,
  autoFocus,
}: {
  action: FallbackAction;
  index: number;
  autoFocus?: boolean;
}) {
  const { label, tone = "default", hidden, to, search, params, ...handlers } = action;

  const className = cn("group focus-visible:outline-none", TONE_CLASS[tone], hidden && "hidden");
  const content = (
    <FallbackActionLabel delay={hidden ? undefined : FIRST_DELAY + index * DELAY_STEP}>
      {label}
    </FallbackActionLabel>
  );

  if (!to) {
    return (
      <button className={className} autoFocus={autoFocus} {...handlers}>
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to as string}
      search={search as never}
      params={params as never}
      className={className}
      autoFocus={autoFocus}
      {...handlers}
    >
      {content}
    </Link>
  );
}

export function Fallback({
  title,
  actions = [],
  scramble = true,
  className,
  onTitleClick,
  onScrambleComplete,
  children,
}: {
  title: React.ReactNode;
  actions?: FallbackAction[];
  /** set false where the title is already animated by its own errorComponent */
  scramble?: boolean;
  className?: string;
  onTitleClick?: () => void;
  onScrambleComplete?: () => void;
  children?: React.ReactNode;
}) {
  const reduced = useIsReducedMotion();
  const { isMobileDevice: spacious } = useBreakpoint();

  return (
    <div
      className={cn(
        "transition-colors px-12 flex font-mono flex-col min-h-safe-dvh items-center justify-center text-center select-none",
        spacious ? "gap-3" : "gap-2",
        className,
      )}
    >
      <span
        onClick={onTitleClick}
        className="animate-in fade-in animation-delay-100 fill-mode-backwards mb-1"
      >
        {scramble && typeof title === "string" ? (
          <TextScramble trigger={!reduced} onScrambleComplete={onScrambleComplete}>
            {title}
          </TextScramble>
        ) : (
          title
        )}
      </span>

      {actions.map((action, index) => (
        <FallbackActionItem
          key={index}
          action={action}
          index={index}
          // land keyboard/screen-reader focus on the first real action without making
          // visitors click into the page first — 404s especially have nothing else to focus
          autoFocus={
            index === actions.findIndex((candidate) => !candidate.hidden) && !action.hidden
          }
        />
      ))}

      {children}
    </div>
  );
}
