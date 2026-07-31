import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getServerTime = createServerFn().handler(() => {
  // This runs only on the server
  return { date: new Date().toISOString() };
});

export const Route = createFileRoute("/developer/")({
  loader: () => getServerTime(),
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useLoaderData();
  return (
    <div>
      removed to reduce build size. {date} every byte counts!<br></br>
      <Route.Link to="bsod">link to bsod</Route.Link>
    </div>
  );
}
