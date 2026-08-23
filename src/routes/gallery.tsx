import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/eda/under-construction", replace: true });
  },
});
