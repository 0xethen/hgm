import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/feedback")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/report", search: { t: "feedback" } });
  },
});
