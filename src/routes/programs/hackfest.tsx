import { createFileRoute } from "@tanstack/react-router";
import { eventInfo } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-shared";
import { ExtLink } from "#/components/ui/ethendotapp/link.tsx";

// TODO: fill this page out

export const Route = createFileRoute("/programs/hackfest")({
  component: () => (
    <ProgramsEventPage
      event={eventInfo.hackfest}
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
  ),
});
