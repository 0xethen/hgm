import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/programs/hackathon/register" replace />
      <Link to="/programs/hackathon/register" className="link">
        Continue to hackathon registration
      </Link>
    </>
  );
}
