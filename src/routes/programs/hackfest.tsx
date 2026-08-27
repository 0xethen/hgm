import { createFileRoute, Link } from "@tanstack/react-router";
import { events } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-components";
import { pages } from "cms/pages/pages";
import { md } from "#/lib/markdown";
import { eventSchema } from "#/lib/seo";
import { buildUrl } from "#/lib/utils.ts";

// TODO: fill this page out

const eventId = "hackfest";

export const Route = createFileRoute("/programs/hackfest")({
  staticData: { title: events[eventId].name },
  loader: async () => {
    const content = pages.find((p) => eventId === p._meta.path.slugify());
    return content || { content: "" };
  },
  head: () => ({
    meta: [
      eventSchema({
        name: events[eventId].name,
        description: events[eventId].description,
        startDate: events[eventId].date?.start,
        endDate: events[eventId].date?.end,
        url: buildUrl("/programs/hackfest"),
        location: events[eventId].location,
        price: events[eventId].price || 0,
      }),
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const document = Route.useLoaderData();
  const content = (
    <div
      className="typeset max-w-none space-y-2"
      dangerouslySetInnerHTML={{ __html: md(document.content) }}
    />
  );

  return (
    <ProgramsEventPage
      event={events.hackfest}
      content={content || events[eventId].description}
      additions={{
        left: {
          end: (
            <p>
              Check out our{" "}
              <Link
                to={"https://instagram.com/hackgwinnett" as string}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Instagram
              </Link>{" "}
              for updates on HackFest!
            </p>
          ),
        },
      }}
    />
  );
}
