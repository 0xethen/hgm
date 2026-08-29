import { createFileRoute } from "@tanstack/react-router";
import { pages } from "cms/pages/pages";
import { md } from "#/lib/markdown";
import { ContactForm } from "./-contact";
import { NewsletterCTA } from "#/components/elements/ctas/NewsletterCTA.tsx";
import { brand } from "#/lib/meta/brand";

const ABOUT_POST_ID = "about-us";
const fallback = brand.description;

export const Route = createFileRoute("/about/")({
  // the header banner runs edge to edge, so this page lays out its own container
  staticData: { title: "About Us", breadcrumb: { hidden: true }, classNames: { container: false } },
  loader: async () => {
    const content = pages.find((p) => ABOUT_POST_ID === p._meta.path.slugify());
    return content;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const content = Route.useLoaderData();

  return (
    <div>
      <div className="relative bg-hg-black flex items-center justify-center h-24 overflow-hidden sm:h-36 lg:h-48">
        {/*<div className="absolute inset-0 bg-hg-green" />*/}
        <div className="absolute inset-0 bg-linear-to-b from-primary to-hg-green" />
        <div className="absolute inset-0 bg-[url('/assets/images/hero/hexagons.svg')] opacity-30" />
        <h1 className="relative font-light font-brand text-5xl uppercase text-white sm:text-6xl lg:text-8xl">
          ABOUT US
        </h1>
      </div>

      <div className="p-4 mx-auto max-w-7xl">
        <div className="my-8" />
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {content ? (
            <div
              className="typeset max-w-none space-y-2"
              dangerouslySetInnerHTML={{ __html: md(content.content || fallback) }}
            />
          ) : (
            fallback
          )}

          <div className="lg:min-w-md">
            <ContactForm />
          </div>
        </div>
        <NewsletterCTA
          className="border p-5 md:p-8 my-10"
          description="Be the first to know when officer applications are open. Plus, learn about upcoming events and opportunities from the HackGwinnett team!"
        />
      </div>
    </div>
  );
}
