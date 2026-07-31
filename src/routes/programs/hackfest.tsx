import { createFileRoute } from "@tanstack/react-router";
import { eventInfo } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-shared";

export const Route = createFileRoute("/programs/hackfest")({
  component: () => <ProgramsEventPage event={eventInfo.hackfest} />,
});
