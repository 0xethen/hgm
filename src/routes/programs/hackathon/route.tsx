import { createFileRoute, Outlet } from "@tanstack/react-router";
import { events } from "#/lib/meta/events";

// the layout owns the title/crumb so /programs/hackathon/register nests under the event
export const Route = createFileRoute("/programs/hackathon")({
  staticData: { title: events.hackathon.name },
  component: Outlet,
});
