import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/report")({
  beforeLoad: async ({ search }) => {
    throw Route.redirect({ to: "/eda/report", search, replace: true });
  },
});
