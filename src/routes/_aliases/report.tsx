import { createFileRoute, Link, Navigate, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/report")({
  loader: async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // simulate a delay TODO TODO TODO
  },
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
