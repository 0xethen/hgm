import { useBreakpoint } from "#/hooks/browser.ts";
import { useSound } from "#/hooks/sound.ts";
import { cn } from "#/lib/utils.ts";
import React, { useEffect, useRef, useState } from "react";

const SPEECH_TEXT = "I love HG!";
const TYPE_SPEED = 30; // ms/char
const SHOW_BUBBLE_FOR = 3500; // ms
const UNMOUNT_AFTER = 500; // ms after hide to unmount (allow animation)

function useTypewriter(text: string, active: boolean, speed = TYPE_SPEED) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // cleanup helper
    const clear = () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (!active) {
      clear();
      indexRef.current = 0;
      setDisplayed("");
      return clear;
    }

    // start typing from beginning
    indexRef.current = 0;
    setDisplayed("");

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current < text.length) {
        timeoutRef.current = window.setTimeout(tick, speed);
      } else {
        timeoutRef.current = null;
      }
    };

    // small delay before showing first char to allow animation syncing
    timeoutRef.current = window.setTimeout(tick, speed);

    return clear;
  }, [active, text, speed]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      // ensure no timers remain
      // @ts-ignore window.clearTimeout accepts number
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, []);

  return displayed;
}

function SpeechBubble({
  direction,
  visible,
  text,
}: {
  direction: "left" | "right";
  visible: boolean;
  text: string;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-40 z-10",
        direction === "left" ? "left-4" : "right-4",
        "duration-300 fill-mode-forwards ease-out",
        "data-[state=show]:animate-in data-[state=show]:fade-in data-[state=show]:slide-in-from-bottom-100",
        "data-[state=hide]:animate-out data-[state=hide]:fade-out data-[state=hide]:slide-out-to-bottom-5",
      )}
      data-state={visible ? "show" : "hide"}
    >
      <div className="relative min-w-20 border-2 border-black bg-white px-3 py-2 shadow-md select-none">
        <div
          className={cn(
            "flex flex-col font-mono text-sm text-black whitespace-nowrap",
            direction === "right" && "text-right",
          )}
        >
          <span className="font-semibold">Jaden</span>
          <span>{text || "..."}</span>
        </div>

        <div
          className={cn(
            "absolute -bottom-2.25 h-4 w-4 rotate-45 border-b-2 border-r-2 border-black bg-white",
            direction === "left" ? "left-6" : "right-6",
          )}
        />
      </div>
    </div>
  );
}

export function LilJadenJr({
  direction = "right",
  onClick,
}: {
  direction?: "left" | "right";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [showBubble, setShowBubble] = useState(false); // controls show/hide animation
  const [mountedBubble, setMountedBubble] = useState(false); // controls mount/unmount
  const hideTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);
  const { isMobileDevice } = useBreakpoint();
  const { play } = useSound();

  const typedText = useTypewriter(SPEECH_TEXT, mountedBubble);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) clearTimeout(hideTimerRef.current);
      if (unmountTimerRef.current != null) clearTimeout(unmountTimerRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    // always ensure bubble is mounted so we can animate in
    if (!mountedBubble) setMountedBubble(true);

    // if already visible, restart the hide timer (so repeated clicks reset timer)
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
    }
    if (unmountTimerRef.current != null) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }

    // show it
    setShowBubble(true);
    play("bading", 0.2);

    // schedule hide
    // @ts-ignore window.setTimeout returns number
    hideTimerRef.current = window.setTimeout(() => {
      setShowBubble(false);
      hideTimerRef.current = null;
      // schedule unmount after the exit animation completes
      unmountTimerRef.current = window.setTimeout(() => {
        setMountedBubble(false);
        unmountTimerRef.current = null;
      }, UNMOUNT_AFTER);
    }, SHOW_BUBBLE_FOR);
  };

  if (isMobileDevice) return null;

  return (
    <div className="z-2 [&>img]:drag-none">
      {/* fixed on the button, not the img: a static button with only an out-of-flow child still
          claims its own line-height worth of layout space, which was silently adding scroll */}
      <button
        type="button"
        aria-label="Jaden side-eye (click for message)"
        onClick={handleClick}
        className={cn(
          "fixed -bottom-12 p-0 bg-transparent border-0",
          direction === "left" ? "left-0" : "right-0",
        )}
      >
        <img
          src={"/assets/images/misc/jadensideeye.png".toAsset()}
          alt="Jaden Dennis side-eyes you"
          className={cn(
            "transition-transform w-15 ease-out",
            mountedBubble
              ? "cursor-help duration-300"
              : // motion-reduce: skip the peek-up-on-hover tease — he's just there, already clickable
                "cursor-pointer translate-y-26 hover:translate-y-24 motion-reduce:translate-y-0",
            direction === "left" && "scale-x-[-1]",
          )}
          draggable={false}
        />
      </button>

      {mountedBubble && (
        <SpeechBubble direction={direction} visible={showBubble} text={typedText} />
      )}
    </div>
  );
}
