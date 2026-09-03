import { createFileRoute } from "@tanstack/react-router";
import { events } from "#/lib/meta/events";
import { EventPage } from "../-components";
import { pages } from "cms/pages/pages";
import { md } from "#/lib/markdown";
import { eventSchema } from "#/lib/seo";
import { buildUrl } from "#/lib/utils.ts";

const event = events.hackfest;

export const Route = createFileRoute("/programs/hackfest/")({
  staticData: { title: event.name },
  loader: async () => {
    const content = pages.find((p) => "hackfest" === p._meta.path.slugify());
    return content || { content: "" };
  },
  head: () => ({
    meta: [
      eventSchema({
        name: event.name,
        description: event.description,
        startDate: event.date?.start,
        endDate: event.date?.end,
        url: buildUrl("/programs/hackfest"),
        location: event.location,
        price: event.price || 0,
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
    <EventPage
      event={event}
      content={content || event.description}
      additions={{
        right: {
          // TODO: end: add hackfest instagram post/photos
        },
      }}
    />
  );
}
