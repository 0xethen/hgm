import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/eda/under-construction", replace: true });
  },
  // component: RouteComponent,
  staticData: { title: "Tools" },
});
