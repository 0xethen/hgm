import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Tools</h2>
      <h3>Bogey</h3>
      <p>Description</p>
      <h3>Birdie</h3>
      <p>Description</p>
      <h3>Legacy</h3>
      <p>
        Our legacy open-source projects are no longer supported, but you're welcome to give them a
        look!
      </p>
      <div className="p-4 bg-hg-black text-white text-center">
        <div>
          <p>Thanks for exploring our toolkit! Use them to build only amazing things.</p>
          <p className="text-hg-green">
            {"psst... try running "}
            <code className="text-primary rounded-md p-1.5" id="console-func">
              {"hg.confetti.start()"}
            </code>
            {" in the browser console for a surprise X)"}
          </p>
        </div>
      </div>
    </div>
  );
}
