import * as React from "react";
import { createFileRoute, Link, type ErrorComponentProps } from "@tanstack/react-router";
import { useForm, useSelector } from "@tanstack/react-form";
import { toast } from "sonner";
import { RiArrowRightLine, RiResetLeftLine } from "@remixicon/react";
import { Kbd } from "#/components/ui/kbd";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { Fallback, type FallbackAction } from "#/components/Fallback.tsx";
import { events } from "#/lib/meta/events";
import { cn } from "#/lib/utils";
import { JsonEditor, type EditorTab, type JsonEditorHandle } from "./-editor.tsx";
import {
  diagnose,
  parseLoose,
  selectionOf,
  type Analysis,
  type Diagnostic,
} from "./-diagnostics.ts";
import { format } from "./-jsonc.ts";
import {
  ABOUT_DOCUMENT,
  aboutSchema,
  buildPrefillUrl,
  FORM_URL,
  TEAM_ROSTER_CHOICE,
  TEAM_DOCUMENT,
  teamSchema,
  wantsRoster,
  type FieldDoc,
  type RegistrationDocument,
} from "./-registration.ts";

const event = events.hackathon;
type DocumentId = RegistrationDocument["id"];

export const Route = createFileRoute("/programs/hackathon/register/")({
  staticData: {
    title: "Register",
    breadcrumb: `Register for ${event.shortName}`,
    description: `Register for ${event.name}, Metro Atlanta's premier hackathon, in an interactive JSON editor!`,
  },
  // a thrown Response can't be serialized across SSR, so the closed state is rendered, not thrown
  component: event.registration?.closed ? ClosedComponent : RouteComponent,
  errorComponent: ErrorComponent,
});

function ClosedComponent() {
  return (
    <Fallback
      title="registration hasn't opened yet"
      actions={[{ label: `back to ${event.shortName}`, to: event.registration?.page ?? "/programs/hackathon" }]}
    />
  );
}

function RouteComponent() {
  const editorRef = React.useRef<JsonEditorHandle>(null);
  const [tab, setTab] = React.useState<DocumentId>("about");

  const form = useForm({
    defaultValues: { about: ABOUT_DOCUMENT.boilerplate, team: TEAM_DOCUMENT.boilerplate },
    validators: [
      {
        // while they type, only complain about what's actually filled in
        triggers: ["change"],
        runOnSubmit: false,
        run: ({ value, createErrorMap }) => {
          const errors = createErrorMap();

          const about = diagnose(value.about, aboutSchema).visible[0];
          if (about) errors.fields.about = about.message;

          if (wantsRoster(parseLoose(value.about))) {
            const team = diagnose(value.team, teamSchema).visible[0];
            if (team) errors.fields.team = team.message;
          }

          return errors;
        },
      },
      {
        // review is the moment the answers they never filled in start counting
        triggers: [],
        run: ({ value, createErrorMap }) => {
          const errors = createErrorMap();

          const about = diagnose(value.about, aboutSchema).all[0];
          if (about) errors.fields.about = about.message;

          if (wantsRoster(parseLoose(value.about))) {
            const team = diagnose(value.team, teamSchema).all[0];
            if (team) errors.fields.team = team.message;
          }

          if (about || errors.fields.team) errors.form = "Some answers still need a look.";

          return errors;
        },
      },
    ],
    onSubmit: ({ value }) => {
      const about = diagnose(value.about, aboutSchema).value;
      if (!about) return;

      const team = wantsRoster(about) ? diagnose(value.team, teamSchema).value : undefined;
      const url = buildPrefillUrl(about, team);
      const opened = window.open(url, "_blank", "noopener,noreferrer");

      if (opened) return;

      toast.warning("Your browser may have blocked the tab", {
        description: "Open the prefilled form yourself to review and finish registering.",
        action: { label: "Open", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
        duration: 20000,
      });
    },
  });

  // before the first review, an answer they haven't typed isn't a mistake — it's just not typed
  const reviewed = useSelector(form.atom, (state) => state.submissionAttempts > 0);
  const aboutText = useSelector(form.atom, (state) => state.values.about);
  const teamText = useSelector(form.atom, (state) => state.values.team);

  const needsTeam = wantsRoster(parseLoose(aboutText));

  const analyses: Record<DocumentId, Analysis<unknown>> = {
    about: diagnose(aboutText, aboutSchema),
    team: diagnose(teamText, teamSchema),
  };

  const problemsIn = (id: DocumentId) => (reviewed ? analyses[id].all : analyses[id].visible);

  // the team tab can't be the active one while it's locked
  const activeId: DocumentId = needsTeam ? tab : "about";
  const activeDocument = activeId === "about" ? ABOUT_DOCUMENT : TEAM_DOCUMENT;
  const activeProblems = problemsIn(activeId);

  const tabs: EditorTab[] = [
    { id: ABOUT_DOCUMENT.id, label: ABOUT_DOCUMENT.name },
    {
      id: TEAM_DOCUMENT.id,
      label: TEAM_DOCUMENT.name,
      disabled: !needsTeam,
      // one tooltip, two jobs: why it's locked, and then that it just opened
      tooltip: needsTeam ? (
        "choose your teammates here"
      ) : (
        <span>
          Set <code>team</code> to "{TEAM_ROSTER_CHOICE}" to choose teammates
        </span>
      ),
      tooltipOpen: needsTeam,
    },
  ];

  const jumpTo = (id: DocumentId, issue: Diagnostic) => {
    setTab(id);
    // the editor has to re-render with the other document before the range means anything
    requestAnimationFrame(() => editorRef.current?.select(...selectionOf(issue)));
  };

  const review = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();

    // tidy up first, so the line numbers they're about to be sent to are the tidy ones
    form.setFieldValue("about", format(form.state.values.about));
    if (needsTeam) form.setFieldValue("team", format(form.state.values.team));

    await form.handleSubmit();

    // land them on the first document with something to fix rather than making them hunt
    const about = diagnose(form.state.values.about, aboutSchema).all[0];
    if (about) return jumpTo("about", about);

    if (!wantsRoster(parseLoose(form.state.values.about))) return;
    const team = diagnose(form.state.values.team, teamSchema).all[0];
    if (team) jumpTo("team", team);
  };

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="font-semibold text-3xl sm:text-4xl">Register</h1>
            <p className="text-base sm:text-lg">
              Tell us about yourself in this interactive form and we'll carry your answers over. Or,
              if you prefer,{" "}
              <Link
                to={FORM_URL as string}
                target="_blank"
                rel="noopener noreferrer"
                className="link font-medium"
              >
                fill out the form normally
              </Link>
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={review}>
            <JsonEditor
              ref={editorRef}
              tabs={tabs}
              activeTab={activeId}
              onSelectTab={(id) => setTab(id as DocumentId)}
              value={activeId === "about" ? aboutText : teamText}
              onChange={(next) => form.setFieldValue(activeId, next)}
              diagnostics={activeProblems}
              fields={activeDocument.fields}
            />

            <Problems
              name={activeDocument.name}
              diagnostics={activeProblems}
              onSelect={(issue) => editorRef.current?.select(...selectionOf(issue))}
            />

            <div className="flex flex-wrap items-center gap-3">
              {/* never disabled: asking to review is how you find out what's still missing */}
              <Button type="submit" size="lg">
                Review
                <RiArrowRightLine />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => {
                  form.setFieldValue("about", ABOUT_DOCUMENT.boilerplate);
                  form.setFieldValue("team", TEAM_DOCUMENT.boilerplate);
                  setTab("about");
                }}
              >
                <RiResetLeftLine />
                Start over
              </Button>
            </div>
          </form>
        </div>

        <FieldReference document={activeDocument} />
      </div>
    </div>
  );
}

function Problems({
  name,
  diagnostics,
  onSelect,
}: {
  name: string;
  diagnostics: readonly Diagnostic[];
  onSelect: (issue: Diagnostic) => void;
}) {
  if (!diagnostics.length) {
    return (
      <p className="font-mono text-sm text-primary" role="status">
        ✓ {name} {/* looks good */}
      </p>
    );
  }

  return (
    // the editor's own problem count is the polite live region; this list is the detail
    <ul className="flex flex-col gap-1 font-mono text-xs sm:text-sm">
      {diagnostics.map((issue, index) => (
        <li key={index}>
          <button
            type="button"
            onClick={() => onSelect(issue)}
            className={cn(
              "text-left hover:underline underline-offset-2",
              "focus-visible:outline-none focus-visible:underline",
            )}
          >
            <span className="text-muted-foreground">
              {name}:{issue.line}:{issue.column}
            </span>{" "}
            <span className={issue.missing ? "text-amber-600" : "text-destructive"}>
              {issue.missing ? "missing" : "error"}
            </span>{" "}
            {issue.message}
          </button>
        </li>
      ))}
    </ul>
  );
}

function FieldRow({ field, depth = 0 }: { field: FieldDoc; depth?: number }) {
  return (
    <div className={cn("space-y-0.5", `ml-${depth * 4}`)}>
      <dt className="font-mono">
        {field.key}
        <span className="text-muted-foreground">
          {field.required ? "" : "?"}: {field.type}
        </span>
      </dt>
      <dd className="text-muted-foreground">
        {field.hint}
        {field.values ? (
          <span className="mt-1 flex flex-wrap gap-1 font-mono text-xs">
            {field.values.map((value) => (
              <span key={value} className="bg-muted px-1.5 py-0.5">
                {value}
              </span>
            ))}
          </span>
        ) : null}
      </dd>
      {field.children?.map((child) => (
        <FieldRow key={child.key} field={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function FieldReference({ document }: { document: RegistrationDocument }) {
  return (
    <aside className="h-fit border p-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold">
        <code>{document.name}</code> reference
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        <Kbd>⇥ tab</Kbd> to autocomplete fields
      </p>

      <Separator className="my-4" />
      {/*<p className="mb-3 font-mono text-xs text-muted-foreground">{document.name}</p>*/}

      <dl className="flex flex-col gap-4 text-sm">
        {document.fields.map((field) => (
          <FieldRow key={field.key} field={field} />
        ))}
      </dl>

      <Separator className="my-4" />

      <p className="text-sm text-muted-foreground">
        You'll pick your workshops on the Google Form itself, along with everything else that
        depends on these answers.
      </p>
    </aside>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  const isResponse = error instanceof Response;
  const title = isResponse
    ? `${error.statusText || "request failed"} (${error.status})`
    : "error launching interactive!";

  const actions: FallbackAction[] = [
    ...(!isResponse ? [{ label: "register manually", to: FORM_URL }] : []),
    {
      label: "report issue",
      to: "/report",
      search: { from: Route.id, c: isResponse ? error.status : undefined, t: "error" },
      tone: "destructive",
    },
  ];

  return <Fallback title={title} actions={actions} />;
}
