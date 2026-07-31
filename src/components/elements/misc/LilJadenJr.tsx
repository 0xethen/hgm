import { useSound } from "#/hooks/sound.ts";
import { cn } from "#/lib/utils.ts";
import { useEffect, useState } from "react";

const SPEECH_TEXT = "I love HG!";
const TYPE_SPEED = 30; // ms/char

const SHOW_BUBBLE_FOR = 3500; // ms

function useTypewriter(text: string, active: boolean, speed = TYPE_SPEED) {
  const [displayed, setDisplayed] = useState(text[0]);

  useEffect(() => {
    if (!active) return;

    setDisplayed(text[0]);
    let i = 1;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);

    return () => clearInterval(id);
  }, [active, text, speed]);

  return displayed;
}

export function LilJadenJr({
  direction = "right",
  onClick,
}: {
  direction?: "left" | "right";
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}) {
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(false);
  const [renderSpeechBubble, setRenderSpeechBubble] = useState(false); // stay css-hidden until first click, then only change opacity
  const { play } = useSound();

  const typedText = useTypewriter(SPEECH_TEXT, renderSpeechBubble);

  const clickEvent = (e: React.MouseEvent<HTMLImageElement>) => {
    onClick?.(e);
    if (renderSpeechBubble) return;

    setRenderSpeechBubble(true);
    setShowSpeechBubble(true);
    play("bading", 0.2);

    setTimeout(() => setShowSpeechBubble(false), SHOW_BUBBLE_FOR);
    setTimeout(() => setRenderSpeechBubble(false), SHOW_BUBBLE_FOR + 500);
  };

  return (
    <div className="z-2 [&>img]:drag-none">
      <img
        src="/assets/images/misc/jadensideeye.png"
        alt="Jaden Dennis side-eyes you"
        className={cn(
          "fixed -bottom-12",
          "transition-transform hidden lg:block w-15 ease-out",
          renderSpeechBubble
            ? "cursor-help duration-300"
            : "cursor-pointer translate-y-26 hover:translate-y-24",
          direction === "left" ? "left-0 scale-x-[-1]" : "right-0",
        )}
        onClick={clickEvent}
      />

      {renderSpeechBubble && (
        <div
          className={cn(
            "fixed bottom-35 z-10",
            direction === "left" ? "left-8" : "right-8",
            "duration-300 fill-mode-forwards ease-out",
            "data-[state=show]:animate-in data-[state=show]:fade-in data-[state=show]:slide-in-from-bottom-100",
            "data-[state=hide]:animate-out data-[state=hide]:fade-out data-[state=hide]:slide-out-to-bottom-5",
          )}
          data-state={showSpeechBubble ? "show" : "hide"}
        >
          <div
            className={cn(
              "relative min-w-20 border-2 border-black bg-white px-3 py-2 shadow-md select-none",
            )}
          >
            <div
              className={cn(
                "flex flex-col",
                "font-mono text-sm text-black whitespace-nowrap",
                direction === "right" && "text-right",
              )}
            >
              <span className="font-semibold">Jaden</span>
              <span>{typedText}</span>
              {/*<span className="animate-pulse">|</span>*/}
            </div>

            {/* tail */}
            <div
              className={cn(
                "absolute -bottom-2.25 h-4 w-4 rotate-45 border-b-2 border-r-2 border-black bg-white",
                direction === "left" ? "left-6" : "right-6",
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
