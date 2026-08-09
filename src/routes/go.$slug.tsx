import { createFileRoute, notFound } from "@tanstack/react-router";
import { brandInfo } from "#/lib/meta/brand";

const goRedirects: Record<string, string> = {
  // main site/quick links
  register:
    "https://docs.google.com/forms/d/e/1FAIpQLSfZn384gkF09tDDLrMyxB9WhqiCsW3_hMMEek7lDLB_L-gjNw/viewform",
  issues: "/report",
  workshops: "/programs/hackathon#workshops",
  wsarchive: "https://github.com/hackgwinnett/workshops",

  // socials
  instagram: brandInfo.socials.instagram || "/",
  youtube: brandInfo.socials.youtube || "/",
  discord: brandInfo.socials.discord || "/",

  // time-sensitive redirects
  summerws26: "/posts/summer-workshops-with-peach-state-2026",
};

// FOR THE RECORD, I opened #7141 in TanStack/router TWO MONTHS AGO
// but I didn't see that it was closed an hour later until... just now :P
// anyway this patchPath needs to be here to avoid page hangs
// update 7/14: bug only occurs when a route tries to preload via link hover
// update 8/1: we're going to keep patchPath to deal with unexpected behavior

const patchPath = (href: string) => {
  return href.startsWith("/") ? { to: href } : { href };
};

export const Route = createFileRoute("/go/$slug")({
  staticData: {
    title: { page: "Redirecting...", exact: true },
    header: { hidden: true },
  },
  loader: ({ params }) => {
    const { slug } = params;

    if (goRedirects[slug]) {
      return Route.redirect(patchPath(goRedirects[slug]));
    }

    throw notFound();
  },
});
