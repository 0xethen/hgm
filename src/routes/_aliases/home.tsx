import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/" replace />
      <Link to="/" className="link">
        Continue to the homepage
      </Link>
    </>
  );
}
