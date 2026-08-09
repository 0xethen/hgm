import { Header } from "#/components/elements/nav/Header";
import { cn } from "#/lib/utils";

export function HomepageHeader({ isScrolled }: { isScrolled: boolean }) {
  return (
    <Header
      className={cn("transition-all", isScrolled && "bg-hg-black/80 backdrop-blur-sm")}
      classNames={{
        navigationMenu: {
          items: {
            global: isScrolled ? "hover:text-black focus:hover:bg-white" : undefined,
            link: isScrolled ? "hover:bg-white" : undefined,
            dropdown: isScrolled
              ? "hover:bg-white/50 data-popup-open:bg-white/20 data-popup-open:hover:bg-white"
              : undefined,
          },
        },
      }}
      detached
    />
  );
}
