import { createFileRoute, Outlet } from "@tanstack/react-router";
import { events } from "#/lib/meta/events";

export const Route = createFileRoute("/programs/hackathon")({
  staticData: { title: events.hackathon.name },
  component: Outlet,
});
