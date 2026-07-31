import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/birdie")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Coming soon...</div>;
}
