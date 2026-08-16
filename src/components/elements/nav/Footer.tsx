import { useEffect, useState } from "react";
import { Link, useHydrated } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

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
          <Link
            to={"https://github.com/hackgwinnett/www" as string}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {sha}
          </Link>
          )
        </span>
        <div className="flex flex-row gap-4">
          <Link
            to={"https://ethen.app/legal?s=hgm" as string}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("link", "text-sm text-white/50 hover:text-white")}
          >
            Cookies / Privacy Policy
          </Link>
          {link}
        </div>
      </div>
    </footer>
  );
}
