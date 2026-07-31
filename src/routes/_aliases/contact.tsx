import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_aliases/contact")({
  beforeLoad: async () => {
    throw Route.redirect({ to: "/about", hash: "contact" });
  },
});
