import { createFileRoute, Outlet } from "@tanstack/react-router";
// import { Spinner } from "#/components/ui/spinner";
import { noindex } from "#/lib/seo";

export const Route = createFileRoute("/_aliases")({
  staticData: {
    title: "Redirecting...",
    breadcrumb: { hidden: true },
  },
  head: () => ({ meta: noindex() }),
  component: Outlet,
});

// I let AI rewrite the aliases. may have been a mistake because it's way less clean
// but apparently it plays nicer during prerender :,)
