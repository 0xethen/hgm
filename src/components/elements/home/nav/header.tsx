import { Header } from "#/components/elements/nav/Header";
import { cn } from "#/lib/utils";

export function HomepageHeader({ isScrolled }: { isScrolled: boolean }) {
  return (
    <Header
      className={cn("transition-all", isScrolled && "bg-hg-black/80 backdrop-blur-sm")}
      classNames={{
        navigationMenu: {
          items: {
            global: isScrolled
              ? "hover:bg-white/50 data-popup-open:hover:bg-white hover:text-black data-popup-open:text-black focus:bg-transparent"
              : undefined,
            link: isScrolled ? "hover:bg-white" : undefined,
          },
        },
      }}
      detached
    />
  );
}
