import { Footer } from "#/components/elements/nav/Footer";
import { useIsReducedMotion } from "#/hooks/browser.ts";

export function HomepageFooter() {
  const reducedMotion = useIsReducedMotion();

  return (
    <Footer
      link={
        <button
          className="link not-hover:text-white/50"
          onClick={() =>
            document
              .getElementById("top")
              ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
          }
        >
          Back to top
        </button>
      }
    />
  );
}
