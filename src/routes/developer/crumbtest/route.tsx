import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/developer/crumbtest")({
  staticData: { title: "Crumb Test" },
  component: Outlet,
});
