import * as React from "react";
import {
  HeadContent,
  Scripts,
  createRootRoute,
  useMatches,
  type RootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { type Register } from "@tanstack/react-start";

import { TooltipProvider } from "#/components/ui/tooltip";
import { Toaster } from "#/components/ui/sonner";
import { Header } from "#/components/elements/nav/Header";
import { Footer } from "#/components/elements/nav/Footer";
import { ConsoleSecrets } from "#/routes/thecakeisalie";
import { cn } from "#/lib/utils";
import { Breadcrumbs } from "#/components/elements/nav/Breadcrumbs";
import {
  getContainerClassName,
  getBreadcrumbs,
  getDescription,
  getTitle,
  showsChrome,
} from "#/lib/routing";
import { breadcrumbSchema, organizationSchema, seo } from "#/lib/seo";
import { brand, socialLinks } from "#/lib/meta/brand";

import css from "#/styles/index.css?url";

const BRAND_THEME_COLOR = "rgb(97,178,138)";

/** what most pages were writing out by hand; override per route with staticData.classNames.container */
const PAGE_CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-9 md:py-9";

export const Route: RootRoute<Register> = createRootRoute({
  // the first crumb of every trail; see `breadcrumb` in src/router.tsx
  staticData: { breadcrumb: "Home" },
  head: ({ matches }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: BRAND_THEME_COLOR },
      ...seo({
        title: getTitle(matches),
        description: getDescription(matches, brand.description),
      }),
      // only when there is a real trail: structured data must match what the page shows
      ...(getBreadcrumbs(matches).length > 1 ? [breadcrumbSchema(getBreadcrumbs(matches))] : []),
      organizationSchema({
        name: brand.name,
        logo: "/assets/images/brand/hackgwinnett.svg".toAsset(),
        sameAs: [
          socialLinks.instagram,
          socialLinks.youtube,
          socialLinks.discord,
          "https://github.com/hackgwinnett",
        ],
      }),
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico".toAsset() },
      { rel: "stylesheet", href: css },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const matches = useMatches();

  const activeMatch = matches[matches.length - 1];
  const staticData = activeMatch?.staticData;
  const classNames = staticData?.classNames;

  const showChrome = showsChrome(matches);

  // a lone "Home" is noise, so a trail needs somewhere to point back to
  const crumbs = getBreadcrumbs(matches);
  const showBreadcrumbs = crumbs.length > 1;

  const layoutOffset = showChrome || !!staticData.header?.forceLayoutOffset;

  // one place decides how wide a page is and how far it sits from the edges. a page without
  // chrome (the homepage, a 404, the BSOD) is laying itself out full-bleed, so it gets no wrapper
  const container = showChrome ? getContainerClassName(matches) : false;

  return (
    <html
      lang="en"
      data-header={layoutOffset}
      className={cn("font-sans overscroll-x-none", !showChrome && "relative", classNames?.root)}
    >
      <head>
        <HeadContent />
      </head>
      <body className={cn("bg-hg-black", classNames?.body)}>
        <TooltipProvider>
          {showChrome ? (
            <Header
              className={staticData.header?.className}
              classNames={staticData.header?.classNames}
            />
          ) : null}

          <main id="main" className={cn("min-h-safe-dvh bg-background", classNames?.main)}>
            {container === false ? (
              children
            ) : (
              <div className={cn(PAGE_CONTAINER, container)}>
                {showBreadcrumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
                {children}
              </div>
            )}
          </main>

          {showChrome ? <Footer /> : null}

          <Toaster theme="light" duration={8000} richColors closeButton position="bottom-center" />

          {import.meta.env.DEV ? (
            <TanStackDevtools
              config={{
                position: "bottom-right",
                customTrigger: (
                  <img
                    src={"/assets/images/brand/hgdeveloper.png".toAsset()}
                    className="size-12 rounded-full border-2 border-border"
                    alt="Open devtools"
                  />
                ),
              }}
              plugins={[
                {
                  name: "Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          ) : null}
        </TooltipProvider>

        <Scripts />
        <ConsoleSecrets />
      </body>
    </html>
  );
}
