import { createFileRoute, Link, Navigate, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/report")({
  component: RouteComponent,
});

function RouteComponent() {
  const search = useSearch({ strict: false }); // validated @ /eda/report

  return (
    <>
      <Navigate to="/eda/report" search={search} replace />
      <Link to="/eda/report" search={search} className="link">
        Continue to the report form
      </Link>
    </>
  );
}
