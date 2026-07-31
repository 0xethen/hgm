import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/report")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/eda/report" });
  },
});
