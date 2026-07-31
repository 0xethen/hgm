import { useRef, useState } from "react";
import { Link } from "#/components/ui/ethendotapp/link";
import { useLocation, useNavigate, type NotFoundRouteProps } from "@tanstack/react-router";
import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
import { useIsReducedMotion } from "#/hooks/browser.ts";
import { cn } from "#/lib/utils";
import { sleep } from "#/lib/utils";
import { LilJadenJr } from "#/components/elements/misc/LilJadenJr";

const messages = [
  "the page you're looking for doesn't exist. bummer.",
  "the page you're looking for doesn't exist. strange.",
  "the page you're looking for doesn't exist. interesting.",
  "the page you're looking for doesn't exist. how unusual.",
  "the page you're looking for doesn't exist anymore. did it ever?",
  "this page seems to have wandered off. weirrrd.",
];

export const SECRET_THRESHOLD = 10;

export function NotFound(
  props?: NotFoundRouteProps & {
    title?: string;
    link?: { text: string; href: string };
  },
) {
  const [message] = useState(messages[Math.floor(Math.random() * messages.length)]);
  const [scramble, setScramble] = useState(false);
  const [secretCount, setSecretCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [secretLocked, setSecretLocked] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useIsReducedMotion();

  const homeLinkRef = useRef<HTMLAnchorElement>(null);
  const reportLinkRef = useRef<HTMLAnchorElement>(null);
  const secretButtonRef = useRef<HTMLButtonElement>(null);

  const switchLinkFocus = async (e: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (import.meta.env.DEV && e.key === "e") void displaySecret(true);
    if (secretLocked) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    if (["w", "s", "ArrowUp", "ArrowDown", "Tab"].includes(e.key)) {
      e.preventDefault();

      switch (document.activeElement) {
        case homeLinkRef.current:
          reportLinkRef.current?.focus();
          break;
        case reportLinkRef.current:
          homeLinkRef.current?.focus();
          break;
        case secretButtonRef.current:
          homeLinkRef.current?.focus();
          break;
      }

      setSecretCount((prev) => prev + 1);
      if (secretCount <= SECRET_THRESHOLD) {
        console.log(`[secret] ${secretCount}/${SECRET_THRESHOLD}`);
        if (secretCount === SECRET_THRESHOLD) void displaySecret();
      } else if (secretCount % SECRET_THRESHOLD === 0)
        console.log("[secret] that won't work again");
    }
  };

  const displaySecret = async (manual?: boolean) => {
    if (manual) setSecretCount(0);

    setSecretLocked(true);
    setShowSecret(true);
    await sleep(20);
    secretButtonRef.current?.focus();
    await sleep(1500);
    setSecretLocked(false);
  };

  const hideSecret = (e?: React.FocusEvent<HTMLButtonElement>) => {
    if (e?.relatedTarget !== homeLinkRef.current && e?.relatedTarget !== reportLinkRef.current)
      console.log("[secret] shh, it's a secret"); // no switching windows!

    setShowSecret(false);
  };

  const doSecret = (e?: React.MouseEvent<HTMLButtonElement>) => {
    homeLinkRef.current?.focus();
    hideSecret();

    if (e?.shiftKey) setSecretCount(0);

    // if (localStorage.getItem("eda-hgm-secret-achieved")) return; // TODO: should we prevent them from doing it twice? nah
    localStorage.setItem("eda-hgm-secret-achieved", Date.now().toString());
    throw navigate({ href: "https://creators.ethen.app/nfheat/gallery" });
  };

  const refocus = () => {
    // is there a better way to do this?
    if (
      document.activeElement !== homeLinkRef.current &&
      document.activeElement !== reportLinkRef.current
    )
      homeLinkRef.current?.focus();
  };

  return (
    <div onMouseUp={refocus}>
      {!showSecret && <LilJadenJr onClick={refocus} />}
      <div
        className={cn(
          "transition-colors px-12 flex font-mono flex-col min-h-safe-dvh items-center justify-center text-center gap-2 select-none",
          showSecret && "bg-black text-white",
        )}
        // no one, including lil jaden jr, should unfocus the linkgroup maybe a listener instead?
      >
        <span className="animate-in fade-in animation-delay-100 fill-mode-backwards">
          <TextScramble
            trigger={!reduced}
            onScrambleComplete={() => {
              if (homeLinkRef.current) homeLinkRef.current.focus();
            }}
          >
            {props?.title || message || messages[0]}
          </TextScramble>
        </span>

        <div className="flex flex-col items-center gap-1">
          <Link
            ref={homeLinkRef}
            to={props?.link?.href || "/"}
            className={cn(
              "group",
              "transition-transform not-motion-reduce:hover:-translate-y-px",
              "focus-visible:decoration-foreground/50 focus-visible:hover:decoration-foreground",
              "focus-visible:outline-none",
            )}
            onKeyDown={switchLinkFocus}
            unstyled
          >
            <span className="font-bold animate-in fade-in animation-duration-2000 animation-delay-600 fill-mode-backwards">
              <span className="hidden group-focus:inline mr-1.5">{">"}</span>
              <span className="group-hocus:underline">{props?.link?.text || "go home"}</span>
              <span className="hidden group-focus:inline ml-1.5">{"<"}</span>
            </span>
          </Link>

          <Link
            ref={reportLinkRef}
            to="/eda/report"
            search={{ from: props?.routeId || location.pathname, c: 404, t: "missing-content" }}
            className={cn(
              "group",
              "not-motion-reduce:hover:animate-shake-once",
              "hocus:text-destructive",
              "focus-visible:decoration-destructive/50 focus-visible:hover:decoration-destructive",
              "focus-visible:outline-none",
            )}
            onKeyDown={switchLinkFocus}
            unstyled
          >
            <span className="font-bold animate-in fade-in animation-duration-1500 animation-delay-900 fill-mode-backwards">
              <span className="hidden group-focus:inline mr-1.5">{">"}</span>
              <span className="group-hocus:underline">
                <TextScramble
                  trigger={scramble}
                  onHoverStart={() => setScramble(true)}
                  onHoverEnd={() => setScramble(false)}
                  deTriggerStopsScramble
                >
                  report issue
                </TextScramble>
              </span>
              <span className="hidden group-focus:inline ml-1.5">{"<"}</span>
            </span>
          </Link>

          <button
            ref={secretButtonRef}
            className={cn(
              "group",
              !showSecret && "hidden",
              "hocus:text-green-500",
              "focus-visible:decoration-green-500/50 focus-visible:hover:decoration-green-500",
              "focus-visible:outline-none",
            )}
            onClick={doSecret}
            onKeyDown={switchLinkFocus}
            onBlur={hideSecret}
          >
            <span>
              <span className="hidden group-focus:inline mr-1.5">{">"}</span>
              <span>
                {showSecret && (
                  <TextScramble trigger duration={1.5} speed={0.02}>
                    [ ? ? ? ]
                  </TextScramble>
                )}
                {/* todo: actually finish this easter egg */}
              </span>
              <span className="hidden group-focus:inline ml-1.5">{"<"}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
