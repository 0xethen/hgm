import { createFileRoute, Link } from "@tanstack/react-router";
import { RiArrowRightLine, RiMapPinLine, RiTimeLine } from "@remixicon/react";
import { Button } from "#/components/ui/button";
import { events, type EventKey } from "#/lib/meta/events";
import { formatEventDate } from "./-components";

const order: EventKey[] = ["hackathon", "hackfest"];

const paths: Record<EventKey, string> = {
  hackathon: "/programs/hackathon",
  hackfest: "/programs/hackfest",
};

export const Route = createFileRoute("/programs/")({
  staticData: {
    title: "Programs",
    breadcrumb: false, // route.tsx
    description: "The events HackGwinnett runs for students across Metro Atlanta.",
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="font-semibold text-4xl">Programs</h1>
        <p className="text-muted-foreground">Events brought to you by the HackGwinnett Team</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {order.map((key) => {
          const event = events[key];

          return (
            <article key={key} className="flex flex-col gap-4 border p-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{event.name}</h2>
                <p className="text-muted-foreground">{event.description}</p>
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                {event.date ? (
                  <div className="flex items-start gap-2">
                    <dt className="mt-0.5">
                      <RiTimeLine className="size-4 text-muted-foreground" />
                      <span className="sr-only">When</span>
                    </dt>
                    <dd>{formatEventDate(event.date.start, event.date.end)}</dd>
                  </div>
                ) : null}
                <div className="flex items-start gap-2">
                  <dt className="mt-0.5">
                    <RiMapPinLine className="size-4 text-muted-foreground" />
                    <span className="sr-only">Where</span>
                  </dt>
                  <dd>{event.location.shortName || event.location.name}</dd>
                </div>
              </dl>

              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <Button variant="outline" render={<Link to={paths[key]} />} nativeButton={false}>
                  Learn more
                  <RiArrowRightLine />
                </Button>
                {event.registration && !event.registration.closed ? (
                  <Button
                    render={<Link to={event.registration.page || event.registration.url} />}
                    nativeButton={false}
                  >
                    Register
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
