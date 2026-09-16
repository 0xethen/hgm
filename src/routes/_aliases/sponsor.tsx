import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/sponsor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/sponsors" replace />
      <Link to="/sponsors" className="link">
        Continue to Sponsor Page
      </Link>
    </>
  );
}
