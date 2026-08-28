import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Spinner } from "#/components/ui/spinner";
import { noindex } from "#/lib/seo";

export const Route = createFileRoute("/_aliases")({
  staticData: {
    title: "Redirecting...",
    breadcrumb: { hidden: true },
  },
  head: () => ({ meta: noindex() }),
  component: RouteComponent,
});

// I let AI rewrite the aliases. may have been a mistake because it's way less clean
// but apparently it plays nicer during prerender :,)

function RouteComponent() {
  return (
    <div className="min-h-safe-dvh flex flex-col items-center justify-center gap-3 px-6 text-center">
      <Spinner className="size-8 text-muted-foreground" />
      <Outlet />
    </div>
  );
}
