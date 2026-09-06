import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { md } from "#/lib/markdown.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { noindex } from "#/lib/seo";

// yawn
export const Route = createFileRoute("/a/sender")({
  staticData: { classNames: { container: false } },
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  head: () => ({ meta: noindex() }),
  component: RouteComponent,
});

const DRAFT_KEY = "hg-newsletter-draft";

const DEFAULT_MARKDOWN = `# HackGwinnett Weekly

We've got some exciting things happening!

## Upcoming

- HackGwinnett 2026
- New workshops
- New projects

**See you there!**`;

type Draft = {
  subject: string;
  title: string;
  postUrl: string;
  markdown: string;
};

function loadDraft(): Draft {
  if (typeof localStorage === "undefined") {
    return { subject: "", title: "", postUrl: "", markdown: DEFAULT_MARKDOWN };
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { subject: "", title: "", postUrl: "", markdown: DEFAULT_MARKDOWN };
    return { subject: "", title: "", postUrl: "", markdown: DEFAULT_MARKDOWN, ...JSON.parse(raw) };
  } catch {
    return { subject: "", title: "", postUrl: "", markdown: DEFAULT_MARKDOWN };
  }
}

type Stats = { verified: number; pending: number; unsubscribed: number };

function RouteComponent() {
  const [scriptUrl, setScriptUrl] = useState(
    () => import.meta.env.PUBLIC_APPS_SCRIPT_SENDER_URL || "",
  );
  const [secret, setSecret] = useState(() => import.meta.env.PUBLIC_NEWSLETTER_SENDER_SECRET || "");
  const [testEmail, setTestEmail] = useState(
    () => import.meta.env.PUBLIC_NEWSLETTER_TEST_EMAIL || "",
  );

  const draft = useMemo(loadDraft, []);
  const [subject, setSubject] = useState(draft.subject);
  const [title, setTitle] = useState(draft.title);
  const [postUrl, setPostUrl] = useState(draft.postUrl);
  const [markdown, setMarkdown] = useState(draft.markdown);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ subject, title, postUrl, markdown }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [subject, title, postUrl, markdown]);

  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [status, setStatus] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (!scriptUrl.trim() || !secret.trim()) return;

    const controller = new AbortController();

    void (async () => {
      try {
        const url = new URL(scriptUrl.trim());
        url.searchParams.set("action", "stats");
        url.searchParams.set("secret", secret.trim());

        const response = await fetch(url.toString(), { signal: controller.signal });
        const result = await response.json();

        if (!result.success) throw new Error(result.message || "Failed to load stats.");
        setStats(JSON.parse(result.message));
        setStatsError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatsError(error instanceof Error ? error.message : "Failed to load stats.");
      }
    })();

    return () => controller.abort();
  }, [scriptUrl, secret]);

  const previewHtml = useMemo(() => {
    return md(markdown);
  }, [markdown]);

  function buildPayload() {
    const html = md(markdown);

    const text = markdown
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)");

    return {
      subject: subject.trim(),
      title: title.trim(),
      html,
      text,
      postUrl: postUrl.trim(),
    };
  }

  function validate(): string | null {
    if (!scriptUrl.trim()) return "Set PUBLIC_APPS_SCRIPT_SENDER_URL (or paste the /exec URL).";
    if (!secret.trim()) return "Set PUBLIC_NEWSLETTER_SENDER_SECRET (or paste the sender token).";
    if (!subject.trim()) return "Enter an email subject.";
    if (!markdown.trim()) return "Write something for the newsletter.";
    return null;
  }

  async function sendTestEmail() {
    const validationError = validate();
    if (validationError) return setStatus(validationError);
    if (!testEmail.trim()) return setStatus("Enter an email to send the test to.");

    setTestSending(true);
    setStatus("");

    try {
      const body = new URLSearchParams({
        action: "testSend",
        secret: secret.trim(),
        payload: JSON.stringify({ ...buildPayload(), testEmail: testEmail.trim() }),
      });

      const response = await fetch(scriptUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Test send failed.");

      setStatus(`Test email sent to ${testEmail.trim()}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong sending the test.");
    } finally {
      setTestSending(false);
    }
  }

  async function sendNewsletter() {
    const validationError = validate();
    if (validationError) return setStatus(validationError);

    setStatus("");
    setSending(true);

    const payload = buildPayload();

    // a large list can outrun Apps Script's ~6 min execution limit; the server pauses and
    // reports where it left off (`resumeFrom`), so the client keeps calling until `done`
    let resumeFrom = 0;
    let totalSent = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    try {
      for (;;) {
        const body = new URLSearchParams({
          action: "sendNewsletter",
          secret: secret.trim(),
          resumeFrom: String(resumeFrom),
          payload: JSON.stringify(payload),
        });

        const response = await fetch(scriptUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Newsletter failed to send.");
        }

        let details;
        try {
          details = JSON.parse(result.message);
        } catch {
          details = null;
        }

        if (!details) {
          setStatus("Newsletter sent successfully.");
          break;
        }

        totalSent += details.sent;
        totalSkipped += details.skipped;
        totalFailed += details.failed;

        if (details.done === false) {
          setStatus(
            `Still sending: ${totalSent}/${details.total} so far. Continuing automatically...`,
          );
          resumeFrom = details.resumeFrom;
          continue;
        }

        setStatus(`Sent: ${totalSent} • Skipped: ${totalSkipped} • Failed: ${totalFailed}`);
        break;
      }

      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong while sending.");
    } finally {
      setSending(false);
    }
  }

  const validationError = validate();

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-brand text-3xl font-bold tracking-tight">Send Newsletter</h1>
            <p className="mt-2 text-muted-foreground">Create and send a HackGwinnett newsletter.</p>
          </div>

          <div className="flex gap-3 text-sm">
            <StatTile label="Verified" value={stats?.verified} />
            <StatTile label="Pending" value={stats?.pending} />
            <StatTile label="Unsubscribed" value={stats?.unsubscribed} />
          </div>
        </div>

        <div className="mb-6 border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
          Only 100 emails (shared across every user) can be sent per day in the free tier. We should
          move this system to a more robust one soon. Currently, we can send{" "}
          {stats?.verified || "???"}/100 emails per day.
        </div>

        {statsError && (
          <div className="mb-6 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Couldn't load subscriber stats: {statsError}
          </div>
        )}

        {status && (
          <div className="mb-6 border border-border bg-card px-4 py-3 text-sm">{status}</div>
        )}

        <div className="mb-6 border border-border bg-card p-6">
          <h2 className="mb-5 text-lg font-semibold">Script</h2>

          <div className="grid gap-5 md:grid-cols-3">
            <Field>
              <FieldLabel>Execution URL</FieldLabel>
              <Input
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel>Sender token</FieldLabel>
              <Input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Paste sender token"
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel>
                Your email <span className="font-normal text-muted-foreground">for test sends</span>
              </FieldLabel>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@hackgwinnett.org"
                autoComplete="off"
              />
            </Field>
          </div>

          {/* <FieldDescription className="mt-3">
            Set <code>PUBLIC_APPS_SCRIPT_SENDER_URL</code> and{" "}
            <code>PUBLIC_NEWSLETTER_SENDER_SECRET</code> in your local <code>.env</code> to skip
            pasting these every time — see <code>docs/NEWSLETTER.md</code>.
          </FieldDescription> */}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Newsletter</h2>

            <Field className="mb-5">
              <FieldLabel>Subject</FieldLabel>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="HackGwinnett Weekly"
              />
            </Field>

            <Field className="mb-5">
              <FieldLabel>Title</FieldLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's happening at HackGwinnett?"
              />
            </Field>

            <Field className="mb-5">
              <FieldLabel>
                Post URL <span className="font-normal text-muted-foreground">optional</span>
              </FieldLabel>
              <Input
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://hackgwinnett.org/news/..."
              />
            </Field>

            <Field>
              <FieldLabel>Markdown</FieldLabel>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-125 resize-y font-mono text-sm leading-6"
                placeholder="# Hello!"
              />
            </Field>

            <FieldDescription className="mt-2">
              Learn more about{" "}
              <a
                href="https://www.markdownguide.org/basic-syntax/"
                target="_blank"
                rel="noreferrer"
              >
                writing in Markdown
              </a>
            </FieldDescription>

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={testSending || !!validationError}
                onClick={sendTestEmail}
              >
                {testSending ? "Sending test..." : "Send test to yourself"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger
                  disabled={sending || !!validationError}
                  render={<Button className="flex-1" />}
                >
                  {sending ? "Sending..." : "Send Newsletter"}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send this newsletter?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This sends "{subject || "(no subject)"}" to every verified subscriber right
                      now. This can't be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={sendNewsletter}>Send it</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>

          <section className="border border-border bg-muted p-4">
            <div className="mb-3 px-2 text-sm font-medium text-muted-foreground">Preview</div>

            <div className="overflow-hidden border border-border bg-card">
              <div className="flex items-center justify-center bg-brand px-6 py-8">
                <img
                  src="/assets/images/brand/hackgwinnett.svg"
                  alt="HackGwinnett"
                  className="max-h-16 max-w-55"
                />
              </div>

              <div className="px-8 py-10">
                {title && <h1 className="mb-6 text-3xl font-bold">{title}</h1>}

                <div
                  className="prose space-y-4 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: String(previewHtml),
                  }}
                />

                {postUrl && (
                  <div className="mt-8">
                    <Button render={<a href={postUrl} target="_blank" rel="noreferrer" />}>
                      Read on HackGwinnett →
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-hg-green-alt px-8 py-8 text-center">
                <p className="mb-4 text-xs leading-5 text-primary-foreground/70">
                  You're receiving this email because you subscribed to the HackGwinnett newsletter.
                </p>

                <div className="mb-4 flex justify-center gap-5 text-sm">
                  <a
                    href="https://hackgwinnett.org/go/instagram"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-foreground hover:underline"
                  >
                    Instagram
                  </a>

                  <a
                    href="https://hackgwinnett.org/go/youtube"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-foreground hover:underline"
                  >
                    YouTube
                  </a>

                  <a
                    href="https://hackgwinnett.org/go/x"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-foreground hover:underline"
                  >
                    X (Twitter)
                  </a>
                </div>

                <span className="text-xs text-primary-foreground/70">Unsubscribe</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="border border-border bg-card px-4 py-2 text-center">
      <div className="text-lg font-semibold">{value ?? "—"}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
