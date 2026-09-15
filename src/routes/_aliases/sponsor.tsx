import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/sponsor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/posts/$postId" params={{ postId: "become-a-sponsor" }} replace />
      <Link to="/posts/$postId" params={{ postId: "become-a-sponsor" }} className="link">
        Continue to Sponsor Page
      </Link>
    </>
  );
}
