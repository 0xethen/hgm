import { useEffect, useState } from "react";
import { Link, useHydrated } from "@tanstack/react-router";
import { brand, repo } from "#/lib/meta/brand";

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
    <footer className="bg-hg-green-alt striped-hg-green-alt/20 text-white p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <span className="text-sm text-white/50 text-center md:text-left">
          &copy; {date?.getFullYear() || "2026"} {brand.name}. All rights reserved. (
          <Link
            to={repo.commitUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            title={`${repo.slug} @ ${sha}`}
          >
            {sha}
          </Link>
          )
        </span>
        <div className="flex flex-row flex-wrap justify-center gap-4 text-sm text-white/50">
          <Link
            to="/contact"
            className="link" // text-sm text-white/50 hover:text-white
          >
            Contact Us
          </Link>
          <a
            href={"https://ethen.app/legal?s=hgm"}
            target="_blank"
            className="link" // text-sm text-white/50 hover:text-white
          >
            Cookies & Privacy
          </a>
          {link}
        </div>
      </div>
    </footer>
  );
}
