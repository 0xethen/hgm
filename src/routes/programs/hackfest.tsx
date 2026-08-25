import { createFileRoute, Link } from "@tanstack/react-router";
import { eventInfo } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-components";
import { pages } from "cms/pages/pages";
import { md } from "#/lib/markdown";
import { eventSchema } from "#/lib/seo";

// TODO: fill this page out

const eventId = "hackfest";

export const Route = createFileRoute("/programs/hackfest")({
  staticData: { title: eventInfo[eventId].name },
  loader: async () => {
    const content = pages.find((p) => eventId === p._meta.path.slugify());
    return content || { content: "" };
  },
  head: () => ({
    meta: [
      eventSchema({
        name: eventInfo[eventId].name,
        description: eventInfo[eventId].description,
        startDate: eventInfo[eventId].date?.start,
        endDate: eventInfo[eventId].date?.end,
        url: "https://hackgwinnett.org/programs/hackfest",
        location: eventInfo[eventId].location,
        price: eventInfo[eventId].price || 0,
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
      event={eventInfo.hackfest}
      content={content || eventInfo[eventId].description}
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
