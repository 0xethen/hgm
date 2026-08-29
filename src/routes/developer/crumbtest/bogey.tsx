import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/developer/crumbtest/bogey")({
  staticData: { title: "Bogey" },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-3 p-6 md:p-9">
      <p>
        /developer/crumbtest has no index route, so the trail above reads Home / Crumb Test / Bogey
        with "Crumb Test" as plain text, not a link.
      </p>
      <p>
        <Link to="/developer/crumbtest" className="underline">
          go there anyway
        </Link>{" "}
        &mdash; it 404s instead of rendering a blank page. see guardDeadEnds in
        src/routes/__root.tsx.
      </p>
    </div>
  );
}
