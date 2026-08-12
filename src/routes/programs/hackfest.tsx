import { createFileRoute } from "@tanstack/react-router";
import { eventInfo } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-shared";
import { ExtLink } from "#/components/ui/ethendotapp/link.tsx";
import { pages } from "cms/pages/pages";
import { md } from "#/lib/markdown";

// TODO: fill this page out

const eventId = "hackfest";

export const Route = createFileRoute("/programs/hackfest")({
  staticData: { title: eventInfo[eventId].name },
  loader: async () => {
    const content = pages.find((p) => eventId === p._meta.path.slugify());
    return content || { content: "" };
  },
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
              Check out our <ExtLink href="https://instagram.com/hackgwinnett">Instagram</ExtLink>{" "}
              for updates on HackFest!
            </p>
          ),
        },
      }}
    />
  );
}
