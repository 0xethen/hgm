import { useEffect, useState } from "react";
import { useHydrated } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Magnetic } from "#/components/ui/motion-primitives/magnetic";
import { Link } from "#/components/ui/ethendotapp/link";
import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
import { cn } from "#/lib/utils";
import { RiArrowDownBoxLine, RiArrowRightDoubleLine, RiPlayFill } from "@remixicon/react";
import { ColorBadge } from "#/components/ui/color-badge";
import { eventInfo } from "#/lib/meta/events";
import { DialogTrigger } from "#/components/ui/dialog";
import { videoDialog, videoId } from "./video";
import { useBreakpoint } from "#/hooks/browser.ts";

export function HomepageHero({ isScrolled }: { isScrolled: boolean }) {
  const { md, xl } = useBreakpoint();
  const isMobile = !md;

  const [hackathonOver, setHackathonOver] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    setHackathonOver(eventInfo.hackathon.endDate.getTime() < new Date().getTime());
  }, [hydrated]);

  return (
    <div className="relative min-h-[85dvh] md:min-h-safe-dvh bg-hg-black bg-[url('/assets/images/hero/bgtexture01.svg')] text-white">
      <div className="min-h-[85dvh] md:min-h-safe-dvh px-6 sm:px-8 md:px-12 flex flex-row items-center justify-between gap-12 animate-in fade-in slide-in-from-bottom-5 animation-duration-800 animation-delay-50 fill-mode-backwards">
        <div className="flex flex-col justify-center gap-4 max-w-md sm:max-w-full">
          <ColorBadge
            render={
              <Link to="/posts/$postId" params={{ postId: "new-website-announcement" }} unstyled />
            }
          >
            NEW: Introducing hackgwinnett.org 2.0
            <RiArrowRightDoubleLine />
          </ColorBadge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl max-w-2xl font-mono leading-10 sm:leading-14 md:leading-17 select-none">
            Atlanta's premier{" "}
            <span className="text-primary-light">
              <TextScramble>computer science</TextScramble>
            </span>{" "}
            organization
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80">
            {eventInfo.hackathon.name}{" "}
            {hackathonOver ? (
              <>has concluded. Thank you, everyone!</>
            ) : (
              <>
                is{" "}
                {eventInfo.hackathon.startDate.toLocaleDateString("en-US", {
                  dateStyle: "full",
                })}
                . Sign up today!
              </>
            )}
          </p>
          <div className="flex flex-row gap-4">
            {!eventInfo.hackathon.registration?.closed && (
              <Magnetic intensity={0.4}>
                <Button
                  render={<Link to="/go/$slug" params={{ slug: "register" }} unstyled />}
                  className="cursor-none striped-hg-green hover:brightness-110 hover:not-active:scale-103"
                  variant="hero"
                  size={isMobile ? "sm" : "lg"}
                  nativeButton={false}
                >
                  Register
                </Button>
              </Magnetic>
            )}
            <Magnetic intensity={0.4}>
              <Button
                render={<Link to="/programs/hackathon" unstyled />}
                className="cursor-none hover:not-active:scale-103"
                variant="glass"
                size={isMobile ? "sm" : "lg"}
                nativeButton={false}
              >
                Learn more
              </Button>
            </Magnetic>
            {!xl && (
              <DialogTrigger
                handle={videoDialog}
                render={<button className="link text-base md:text-lg" />}
              >
                Watch video
              </DialogTrigger>
            )}
          </div>
        </div>

        <DialogTrigger handle={videoDialog}>
          <Magnetic
            className="group relative hidden xl:inline-flex max-w-lg cursor-none"
            intensity={0.2}
            range={300}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="HG Hero Video thumbnail"
              className={cn(
                "w-lg aspect-video select-none drag-none",
                "bg-hg-black/50 border-3 border-primary-light border-dashed group-hover:border-solid",
                "transition-[scale,filter] group-hover:scale-101 group-hover:group-active:scale-99",
                "not-group-hover:brightness-80",
              )}
            />
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10",
                "p-1.5 bg-black/50 text-white",
                "transition-opacity group-hover:opacity-0 cursor-none",
              )}
            >
              <RiPlayFill className="size-24" />
            </div>
          </Magnetic>
        </DialogTrigger>
      </div>
      <div className="absolute bottom-0 left-[47dvw] flex justify-center pb-8">
        <Magnetic intensity={0.4}>
          <Button
            className={cn(
              "transition-opacity mx-auto cursor-none",
              "data-[state=show]:animate-in data-[state=hide]:animate-out fill-mode-forwards fade-in slide-in-from-bottom-5 fade-out",
            )}
            data-state={isScrolled ? "hide" : "show"}
            variant="glass"
            size={isMobile ? "icon" : "icon-lg"}
            onClick={() =>
              document.getElementById("subhero")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <RiArrowDownBoxLine className="size-7" />
          </Button>
        </Magnetic>
      </div>
    </div>
  );
}
