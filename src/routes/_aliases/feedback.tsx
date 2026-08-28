import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/feedback")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/eda/report" search={{ t: "feedback" }} replace />
      <Link to="/eda/report" search={{ t: "feedback" }} className="link">
        Continue to feedback
      </Link>
    </>
  );
}
