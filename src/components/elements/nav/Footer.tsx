import { useEffect, useState } from "react";
import { useHydrated } from "@tanstack/react-router";
import { ExtLink } from "#/components/ui/ethendotapp/link";

const FALLBACK_COMMIT_SHA = "dev";

export function Footer({ link }: { link?: React.ReactNode }) {
  const [date, setDate] = useState<Date | null>(null);
  const sha = (import.meta.env.PUBLIC_GIT_SHA || FALLBACK_COMMIT_SHA).substring(0, 7);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    setDate(new Date());
  }, [hydrated]);

  return (
    <footer className="bg-hg-black text-white p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <span className="text-sm text-white/50">
          &copy; {date?.getFullYear() || "2026"} HackGwinnett. All rights reserved. (
          <ExtLink href="https://github.com/hackgwinnett/www">{sha}</ExtLink>)
        </span>
        <div className="flex flex-row gap-4">
          <ExtLink
            href="https://ethen.app/privacy?s=hgm"
            className="text-sm text-white/50 hover:text-white"
          >
            Cookies / Privacy Policy
          </ExtLink>
          {link}
        </div>
      </div>
    </footer>
  );
}
