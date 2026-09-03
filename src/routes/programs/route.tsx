import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/programs")({
  staticData: { breadcrumb: "Programs" },
  component: Outlet,
});
