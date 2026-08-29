import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HomepageHeader } from "#/components/elements/home/nav/header.tsx";
import { HomepageHero } from "#/components/elements/home/hero/content.tsx";
import { HomepageMainContent } from "#/components/elements/home/main/content.tsx";
import { HomepageHeroVideoDialog } from "#/components/elements/home/hero/video.tsx";
import { HomepageFooter } from "#/components/elements/home/nav/footer.tsx";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  staticData: {
    title: "HackGwinnett - Metro Atlanta's Premier CS Organization",
    header: { hidden: true },
  },
});

// guys I have just reconstructed this page after accidentally deleting it it took me 2 hours plz help

const SCROLL_THRESHOLD = 67;

function RouteComponent() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (typeof window === "undefined") return;
      setIsScrolled(window.pageYOffset >= SCROLL_THRESHOLD);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <HomepageHeroVideoDialog />
      <div className="[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:lg:text-4xl [&_h2]:font-bold">
        <div id="top" />
        <HomepageHeader isScrolled={isScrolled} />
        <HomepageHero isScrolled={isScrolled} />

        {/* <div id="subhero" className="bg-hg-green striped-hg-green-alt/20 h-20" /> */}
        <div id="subhero" className="relative bg-hg-black flex items-center justify-center h-24">
          <div className="absolute inset-0 bg-linear-to-b from-hg-green-alt to-hg-green" />
          <div className="absolute inset-0 bg-[url('/assets/images/hero/hexagons.svg')] opacity-30" />
        </div>

        <HomepageMainContent />
        <HomepageFooter />
      </div>
    </>
  );
}
