import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { NotFound } from "#/components/NotFound";
import { ErrorBoundary } from "#/components/ErrorBoundary";
import type { HeaderClassNames } from "#/components/elements/nav/Header";
import type { TitleOption, BreadcrumbOption } from "#/lib/routing";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,

    defaultErrorComponent: ErrorBoundary,
    defaultNotFoundComponent: NotFound,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    title?: TitleOption;
    breadcrumb?: BreadcrumbOption;
    description?: string;
    classNames?: { root?: string; body?: string; main?: string };

    // todo: cleanup? (like bogey)
    header?: {
      className?: string;
      classNames?: HeaderClassNames;
      hidden?: boolean;
      forceLayoutOffset?: boolean;
    };
  }
}
