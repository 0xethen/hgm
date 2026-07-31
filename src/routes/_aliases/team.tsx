import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/team")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/about" });
  },
});
