import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/programs/hackathon" replace />
      <Link to="/programs/hackathon" className="link">
        Continue to the hackathon
      </Link>
    </>
  );
}
