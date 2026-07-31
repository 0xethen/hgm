import { Footer } from "#/components/elements/nav/Footer";

export function HomepageFooter() {
  return (
    <Footer
      link={
        <button
          className="link text-sm text-white/50 hover:text-white"
          onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" })}
        >
          Take me up!
        </button>
      }
    />
  );
}
