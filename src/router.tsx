import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { NotFound } from "#/components/NotFound";
import { ErrorBoundary } from "#/components/ErrorBoundary";
import type { HeaderClassNames } from "#/components/elements/nav/Header";
import { indexDeadEndRoutes, type TitleOption, type BreadcrumbOption } from "#/lib/routing";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,

    defaultErrorComponent: ErrorBoundary,
    defaultNotFoundComponent: NotFound,
  });

  // reachability is a property of the route tree, so index it once here; see #/lib/routing
  indexDeadEndRoutes(router);

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    /** document title; see getTitle in #/lib/routing */
    title?: TitleOption;
    /** overrides the crumb this route contributes; see getBreadcrumbs in #/lib/routing */
    breadcrumb?: BreadcrumbOption;
    /** meta description, inherited by anything nested under this route */
    description?: string;
    /** escape hatches for pages that own their own chrome (the homepage, the BSOD, ...) */
    classNames?: {
      root?: string;
      body?: string;
      main?: string;
      container?: string | false;
    };
    header?: {
      className?: string;
      classNames?: HeaderClassNames;
      hidden?: boolean;
      offset?: boolean;
    };
  }
}
