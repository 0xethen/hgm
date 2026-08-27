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
import { getDescription, getTitle } from "#/lib/routing";
import { organizationSchema, seo } from "#/lib/seo";
import { brand, socialLinks } from "#/lib/meta/brand";

import css from "#/styles/index.css?url";

const BRAND_THEME_COLOR = "rgb(97,178,138)";

export const Route: RootRoute<Register> = createRootRoute({
  head: ({ matches }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: BRAND_THEME_COLOR },
      ...seo({
        title: getTitle(matches),
        description: getDescription(matches, brand.description),
      }),
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

  const showChrome =
    !staticData.header?.hidden && // explicitly hidden via staticData
    !activeMatch?._notFound && // actual nonexistent route or throw notFound()
    !activeMatch?.error; // notFound or error boundary (bsod)

  const layoutOffset = showChrome || !!staticData.header?.forceLayoutOffset;

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
            {children}
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
