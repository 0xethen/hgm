import { useRef, useState } from "react";
import { useLocation, useNavigate, type NotFoundRouteProps } from "@tanstack/react-router";
import { Fallback, type FallbackAction } from "#/components/Fallback";
import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
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

  const homeLinkRef = useRef<HTMLAnchorElement>(null);
  const reportLinkRef = useRef<HTMLAnchorElement>(null);
  const secretButtonRef = useRef<HTMLButtonElement>(null);

  const countSecret = () => {
    setSecretCount((prev) => prev + 1);
    if (secretCount <= SECRET_THRESHOLD) {
      console.log(`[secret] ${secretCount}/${SECRET_THRESHOLD}`);
      if (secretCount === SECRET_THRESHOLD) void displaySecret();
    } else if (secretCount % SECRET_THRESHOLD === 0) console.log("[secret] that won't work again");
  };

  const switchLinkFocus = async (e: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (import.meta.env.DEV && e.key === "e") void displaySecret(true);
    if (secretLocked) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    const forward = ["s", "ArrowDown", "Tab"].includes(e.key);
    const backward = ["w", "ArrowUp"].includes(e.key);
    if (!forward && !backward) return;

    e.preventDefault();

    // w/up and s/down always move opposite directions through the same order tab does
    const order = [homeLinkRef, reportLinkRef, ...(showSecret ? [secretButtonRef] : [])];
    const currentIndex = order.findIndex((ref) => ref.current === document.activeElement);
    const delta = forward ? 1 : -1;
    const nextIndex = (((currentIndex + delta) % order.length) + order.length) % order.length;
    order[nextIndex].current?.focus();

    countSecret();
  };

  const tapTitle = () => {
    // do we need to check for isMobileDevice? nah
    countSecret();
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

    localStorage.setItem("eda-hgm-secret-achieved", Date.now().toString());
    throw navigate({ href: "https://old.ethen.app/nfheat/gallery" });
  };

  const refocus = () => {
    // is there a better way to do this?
    if (
      document.activeElement !== homeLinkRef.current &&
      document.activeElement !== reportLinkRef.current
    )
      homeLinkRef.current?.focus();
  };

  const actions: FallbackAction[] = [
    {
      label: props?.link?.text || "go home",
      to: props?.link?.href || "/",
      ref: homeLinkRef,
      onKeyDown: switchLinkFocus,
    },
    {
      label: (
        <TextScramble
          trigger={scramble}
          onHoverStart={() => setScramble(true)}
          onHoverEnd={() => setScramble(false)}
          deTriggerStopsScramble
        >
          report issue
        </TextScramble>
      ),
      tone: "destructive",
      to: "/report",
      search: { from: props?.routeId || location.pathname, c: 404, t: "nocontent" },
      ref: reportLinkRef,
      onKeyDown: switchLinkFocus,
    },
    {
      // the payoff is still just the gallery link; the tease is the point
      label: showSecret ? (
        <TextScramble trigger duration={1.5} speed={0.02}>
          [ ? ? ? ]
        </TextScramble>
      ) : null,
      tone: "secret",
      hidden: !showSecret,
      ref: secretButtonRef,
      onClick: doSecret,
      onKeyDown: switchLinkFocus,
      onBlur: hideSecret,
    },
  ];

  return (
    <div className="bg-background" onMouseUp={refocus}>
      {!showSecret && <LilJadenJr onClick={refocus} />}
      {/* no one, including lil jaden jr, should unfocus the linkgroup. maybe a listener instead? */}
      <Fallback
        title={props?.title || message || messages[0]}
        actions={actions}
        onTitleClick={tapTitle}
        onScrambleComplete={() => homeLinkRef.current?.focus()}
        className={cn(showSecret && "bg-black text-white")}
      />
    </div>
  );
}
