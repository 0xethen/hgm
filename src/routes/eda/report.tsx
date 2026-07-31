import { useEffect, useState } from "react";
import { createFileRoute, useHydrated, type ErrorComponentProps } from "@tanstack/react-router";
import { ExtLink, Link } from "#/components/ui/ethendotapp/link";
import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
import { cn } from "#/lib/utils";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";

const templates = {
  "missing-content": {
    title: "Missing Content",
    description:
      "Encountered a 404 error. \n(Describe the content that is missing, where you expected to find it, and any other details that might help us track down this pesky bug.)",
  },
  feedback: {
    title: "Feedback / feature request",
    description: "",
  },
};

export const Route = createFileRoute("/eda/report")({
  staticData: { title: "Report a problem" },
  validateSearch: z.object({
    from: z.string().optional(), // the route the user came from, if applicable
    c: z.number().optional(),
    t: z.keyof(z.object(templates)).optional(), // template
  }),
  beforeLoad: ({ search }) => {
    if (search.from === "/thecakeisalie") {
      throw new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 418,
        statusText: "the cake is a lie",
      });
    }
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const { from, c: errorCode, t: templateId } = Route.useSearch();
  const [date, setDate] = useState<string>();
  const link = `https://docs.google.com/forms/d/e/1FAIpQLSd8ngPGYLdc5gZicMCwm2fZN0bkOqZzPcHKVwFhgzchuYpGkw/viewform?pli=1&usp=pp_url&entry.1231647937=HG+Marketing+(hackgwinnett.org)${date && `&entry.2078293770=${date}`}${templateId && `&entry.1830352709=${templates[templateId].description}`}${`&entry.1501072006=eda-generic:[${errorCode}]"${templateId}"from:${from}`}`;
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const now = new Date();

    setDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}+${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    );
  }, [hydrated]);

  return (
    <div className="flex font-heading flex-col min-h-safe-dvh max-w-lg mx-auto items-center justify-center text-center gap-4 px-4">
      <h3>Let's get you on the right path.</h3>
      <p>Click below to report an issue or submit feedback:</p>
      <Button render={<ExtLink href={link} unstyled />} nativeButton={false}>
        Report issue
      </Button>
      <p className="italic text-muted-foreground">
        If you're a real smart cookie, you may want to check out our{" "}
        <ExtLink href="https://github.com/hackgwinnett/www" target="_blank">
          GitHub repository
        </ExtLink>
      </p>
      <Separator />
      <p className="text-muted-foreground text-sm">
        We'll ask for your email, but we'll only contact you if you've previously allowed us or gave
        us confirmation in the form you're about to submit.
      </p>
      <p className="text-muted-foreground text-sm">
        We do this to combat spam by removing submissions from emails with a history of
        intentionally malicious/false reports {":)"}
      </p>
      <p className="text-muted-foreground text-sm">
        Please only submit valid issues related to the HackGwinnett website (hackgwinnett.org). If
        you want to report one of our software products, visit that product's page. If you can't
        find it, or have any other question about HackGwinnett,{" "}
        <Link to="/contact">reach out to us</Link>!
      </p>
    </div>
  );
}

/*
<span>ethen.app issue reporter</span>
<span>Report: {templateId ? templates[templateId].title : "hello"}</span>
<span>
  {templateId
    ? templates[templateId].description.replaceAll("{from}", from || "unknown")
    : "hello"}
</span>
<span> TODO: replace EDA issue reporter with a google form</span>
<ExtLink
  href={`https://docs.google.com/forms/d/e/1FAIpQLSd8ngPGYLdc5gZicMCwm2fZN0bkOqZzPcHKVwFhgzchuYpGkw/viewform?pli=1&usp=pp_url&entry.1231647937=HG+Marketing+(hackgwinnett.org)${date && `&entry.2078293770=${date}`}${templateId && `&entry.1830352709=${templates[templateId].description}`}${`&entry.1501072006=generic-${errorCode}-${templateId}-from:${from}`}`}
>
  Go to form
</ExtLink>
*/

function ErrorComponent(props: ErrorComponentProps) {
  return (
    <div className="flex font-heading flex-col min-h-safe-dvh items-center justify-center text-center gap-1 select-none">
      <span className="animate-in fade-in delay-100 fill-mode-backwards">
        <TextScramble trigger>
          {props.error instanceof Response
            ? `${props.error.statusText} (${props.error.status})`
            : "the issue reporter failed to process your request."}
        </TextScramble>
      </span>
      <div className="flex flex-row items-center gap-3">
        <Link
          to="/"
          className={cn(
            "font-bold animate-in fade-in animation-duration-2000 animation-delay-600 fill-mode-backwards",
            "hover:underline",
          )}
        >
          go home {":("}
        </Link>
        {/* <Link
          to="/"
          className={cn(
            "font-bold animate-in fade-in animation-duration-1500 animation-delay-900 fill-mode-backwards",
            "hover:underline",
          )}
        >
          continue anyway
        </Link> */}
      </div>
    </div>
  );
}
