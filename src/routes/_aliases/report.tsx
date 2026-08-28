import { createFileRoute, Link, Navigate, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/report")({
  component: RouteComponent,
});

function RouteComponent() {
  // this alias declares no schema of its own, so pass whatever came in through to /eda/report,
  // which validates it (a bad `?t=` there falls back rather than erroring here)
  const search = useSearch({ strict: false });

  return (
    <>
      <Navigate to="/eda/report" search={search} replace />
      <Link to="/eda/report" search={search} className="link">
        Continue to the report form
      </Link>
    </>
  );
}
