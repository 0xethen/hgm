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
      <div id="top" />
      <HomepageHeader isScrolled={isScrolled} />
      <HomepageHero isScrolled={isScrolled} />
      <div id="subhero" className="bg-hg-green striped-hg-green-alt/20 h-20" />
      <HomepageMainContent />
      <HomepageFooter />
    </>
  );
}
