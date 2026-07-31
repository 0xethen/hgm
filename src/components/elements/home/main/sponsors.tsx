import * as React from "react";
import { ExtLink } from "#/components/ui/ethendotapp/link";
import { cn } from "#/lib/utils";
import { Scroller } from "#/components/ui/motion-primitives/scroller";
import { type Sponsor, sponsors, statefarm } from "#/lib/meta/sponsors";
import { useBreakpoint } from "#/hooks/browser.ts";

export function SponsorSection() {
  const { md } = useBreakpoint();
  const isMobile = !md;

  const [showGrid, setShowGrid] = React.useState(isMobile);
  const firstSponsorRef = React.useRef<HTMLAnchorElement | null>(null);
  const lastSponsorRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    setShowGrid(isMobile);
  }, [isMobile]);

  const handleFocusCapture = (e: React.FocusEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;

    // Only switch to the grid for keyboard focus (Tab, Shift+Tab, etc.)
    if (!isMobile && target?.matches(":focus-visible")) {
      setShowGrid(true);
    }
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setShowGrid(isMobile);
    }
  };

  const AllSponsors = () => (
    <>
      {sponsors.map((sponsor, index) => {
        const isFirst = index === 0;
        const isLast = index === sponsors.length - 1;

        return (
          <SponsorLogo
            key={`${sponsor.title}-${index}-logo`}
            sponsor={sponsor}
            ref={isFirst ? firstSponsorRef : isLast ? lastSponsorRef : undefined}
          />
        );
      })}
    </>
  );

  return (
    <div
      className="space-y-8 text-center"
      // TODO: roundabout way to make the grid show up on mobile when the user focuses onto a sponsor, but not when they tap on a sponsor logo
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl">Sponsors</h1>

      <div className="space-y-6">
        <SponsorLogo classNames={{ parent: "w-auto", image: "w-70" }} sponsor={statefarm} />

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
            src="/assets/images/sponsors/sf-symbol.svg"
            alt="State Farm Brand Icon"
            className="inline h-[1em] not-hover:grayscale opacity-50 drag-none"
          />
        </span>
      </div>
    </div>
  );
}

type SponsorLogoProps = Omit<React.ComponentPropsWithoutRef<typeof ExtLink>, "href" | "title"> & {
  sponsor: Sponsor;
  classNames?: {
    parent?: string;
    image?: string;
  };
};

const SponsorLogo = React.forwardRef<HTMLAnchorElement, SponsorLogoProps>(
  ({ sponsor, classNames, className, ...props }, ref) => {
    return (
      <ExtLink
        ref={ref}
        href={sponsor.href}
        title={sponsor.title}
        className={cn(
          "group flex items-center justify-center rounded-lg p-3 transition focus-visible:ring-2 focus-visible:ring-ring",
          classNames?.parent,
          className,
        )}
        unstyled
        {...props}
      >
        <img
          src={`/assets/images/sponsors/${sponsor.src}`}
          alt={sponsor.title}
          className={cn(
            "max-h-12 max-w-full object-contain transition sm:grayscale sm:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100 select-none",
            classNames?.image,
          )}
        />
      </ExtLink>
    );
  },
);

SponsorLogo.displayName = "SponsorLogo";
