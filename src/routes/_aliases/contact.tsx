import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/contact")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigate to="/about" hash="contact" replace />
      <Link to="/about" hash="contact" className="link">
        Continue to Contact
      </Link>
    </>
  );
}
