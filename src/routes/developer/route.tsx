import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/developer")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: Outlet,
});
