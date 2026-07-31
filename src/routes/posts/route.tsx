import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({
  component: Outlet,
  pendingComponent: PendingComponent,
});

function PendingComponent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p>Loading posts...</p>
    </div>
  );
}
