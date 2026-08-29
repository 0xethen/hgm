import * as React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { Scroller } from "#/components/ui/motion-primitives/scroller";
import { type Sponsor, mainSponsors, otherSponsors } from "#/lib/meta/sponsors";
import { useBreakpoint, useIsReducedMotion } from "#/hooks/browser.ts";

export function SponsorSection({ title }: { title: React.ReactNode }) {
  const { md } = useBreakpoint();
  const isMobile = !md;
  const reducedMotion = useIsReducedMotion();
  const [hasKeyboardFocus, setHasKeyboardFocus] = React.useState(false);

  // the marquee is the only reason the grid isn't the default, so anything that rules the
  // marquee out (small screens, reduced motion) falls back to the grid
  const showGrid = isMobile || reducedMotion || hasKeyboardFocus;

  const handleFocusCapture = (e: React.FocusEvent<HTMLElement>) => {
    if ((e.target as HTMLElement | null)?.matches(":focus-visible")) {
      setHasKeyboardFocus(true);
    }
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setHasKeyboardFocus(false);
    }
  };

  const AllSponsors = () => (
    <>
      {otherSponsors.map((sponsor, index) => (
        <SponsorLogo key={`${sponsor.title}-${index}-logo`} sponsor={sponsor} />
      ))}
    </>
  );

  return (
    <div
      className="space-y-8 text-center"
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      {title}

      <div className="space-y-6">
        {/* main sponsors (3 per row) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 max-w-5xl mx-auto">
          {mainSponsors.map((sponsor, index) => (
            <SponsorLogo
              key={`main-${sponsor.title}-${index}`}
              sponsor={sponsor}
              classNames={{
                image: "w-70",
              }}
            />
          ))}
        </div>

        {/* other sponsors */}
        {showGrid ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
            <AllSponsors />
          </div>
        ) : (
          <Scroller
            className="mx-auto max-w-4xl w-full mask-x-from-95%"
            speedOnHover={0.5}
            gap={24}
          >
            <AllSponsors />
          </Scroller>
        )}
      </div>

      <div>
        <span className="text-muted-foreground/50">
          Prizes brought to you by{" "}
          <img
            src={"/assets/images/sponsors/sf-symbol.svg".toAsset()}
            alt="State Farm Brand Icon"
            className="inline h-[1em] not-hover:grayscale opacity-50 drag-none"
          />
        </span>
      </div>
    </div>
  );
}

type SponsorLogoProps = Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "title"> & {
  sponsor: Sponsor;
  classNames?: {
    parent?: string;
    image?: string;
  };
};

const SponsorLogo = React.forwardRef<HTMLAnchorElement, SponsorLogoProps>(
  ({ sponsor, classNames, className, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        to={sponsor.href}
        target="_blank"
        rel="noopener noreferrer"
        title={sponsor.title}
        className={cn(
          "group flex items-center justify-center rounded-lg p-3 transition focus-visible:ring-2 focus-visible:ring-ring",
          classNames?.parent,
          className,
        )}
        {...props}
      >
        <img
          src={sponsor.src}
          alt={sponsor.title}
          className={cn(
            "max-h-12 max-w-full object-contain transition sm:grayscale sm:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100 select-none",
            classNames?.image,
          )}
        />
      </Link>
    );
  },
);
