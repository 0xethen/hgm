import { Footer } from "#/components/elements/nav/Footer";
import { useIsReducedMotion } from "#/hooks/browser.ts";

export function HomepageFooter() {
  const reducedMotion = useIsReducedMotion();

  return (
    <Footer
      link={
        <button
          className="link text-sm text-white/50 hover:text-white"
          onClick={() =>
            document
              .getElementById("top")
              ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
          }
        >
          Take me up!
        </button>
      }
    />
  );
}
