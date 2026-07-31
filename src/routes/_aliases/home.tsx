import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/home")({
  staticData: { header: { hidden: true } },
  beforeLoad: async () => {
    throw Route.redirect({ to: "/" });
  },
});
