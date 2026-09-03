import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({
  staticData: { title: "Posts" },
  component: Outlet,
  pendingComponent: PendingComponent,
});

function PendingComponent() {
  return (
    <div>
      <p>Loading posts...</p>
    </div>
  );
}
