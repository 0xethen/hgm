import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/developer/bsod")({
  loader: () => {
    throw new Error("User-initiated exception");
  },
});
