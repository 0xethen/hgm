import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/team")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/about" replace />
      <Link to="/about" className="link">
        Continue to About Us
      </Link>
    </>
  );
}
