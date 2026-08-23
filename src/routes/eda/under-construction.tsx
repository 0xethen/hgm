import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/eda/under-construction")({
  component: RouteComponent,
  staticData: { title: "Under Construction" },
});

function RouteComponent() {
  return (
    <div className="min-h-safe-dvh bg-yellow-800 striped-yellow-900/40">
      {/*<div className="max-w-2xl mx-auto h-full">*/}
      <div className="h-safe-dvh mx-auto max-w-lg px-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold font-mono text-white text-shadow-lg">
          <Link to="/thecakeisalie">under construction</Link>
        </h1>
        <p className="mt-4 text-lg text-white text-shadow-md">
          This page is currently under construction. But good things are coming soon... check back
          later.
        </p>
      </div>
    </div>
  );
}
