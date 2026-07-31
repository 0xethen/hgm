import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/register")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/programs/hackathon" });
  },
});
