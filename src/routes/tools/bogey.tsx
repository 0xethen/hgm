import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/bogey")({
  component: RouteComponent,
  staticData: { title: "Bogey 2" },
});

function RouteComponent() {
  return <div>Coming soon...</div>;
}
