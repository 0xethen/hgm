import { createFileRoute } from "@tanstack/react-router";
import { pages } from "cms/pages";
import { md } from "#/lib/markdown";
import { PastSponsors, Sponsors } from "#/components/elements/home/main/sponsors.tsx";

const SPONSOR_PAGE_ID = "sponsor";
const fallback =
  "Support our mission to empower novice developers! Email us for sponsorship tiers and perks: hackgwinnett@gmail.com";

export const Route = createFileRoute("/sponsors/")({
  staticData: {
    classNames: { container: "max-w-4xl" },
    title: "Sponsors",
  },
  loader: async () => {
    const content = pages.find((p) => SPONSOR_PAGE_ID === p._meta.path.slugify());
    return content;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const content = Route.useLoaderData();

  return (
    <div className="space-y-16">
      <div className="space-y-2">
        <h1 className="font-semibold text-3xl sm:text-4xl">Sponsors</h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          HackGwinnett wouldn't be possible without the support of our sponsors.
        </p>
      </div>

      <Sponsors canScroll={false} />

      <PastSponsors
        title={<h2 className="text-lg font-medium text-muted-foreground">Past Sponsors</h2>}
      />

      {/* max-w-3xl mx-auto */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold shimmer">Become a sponsor</h2>
        <div
          className="typeset max-w-none space-y-2"
          dangerouslySetInnerHTML={{ __html: md(content?.content || fallback) }}
        />
        <iframe
          src="https://docs.google.com/document/d/e/2PACX-1vTQFhS8TkPuUqwVqI6q0O_iu_eCowtc8hYvsgAqY3uEUUyjrbD4t1hXzlcHLXtzoebsjDYa8ifp4E4V/pub?embedded=true"
          className="w-full h-150 border rounded-lg"
        />
      </section>

      {/* <NewsletterCTA
        className="border p-6"
        description="Be the first to know when officer applications are open. Plus, learn about upcoming events and opportunities from the HackGwinnett team!"
      /> */}
    </div>
  );
}
