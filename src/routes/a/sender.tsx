import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { md } from "#/lib/markdown.ts";

export const Route = createFileRoute("/a/sender")({
  component: SendEmailPage,
});

function SendEmailPage() {
  const [scriptUrl, setScriptUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [markdown, setMarkdown] = useState(
    `# HackGwinnett Weekly

We've got some exciting things happening!

## Upcoming

- HackGwinnett 2026
- New workshops
- New projects

**See you there!**`,
  );

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const previewHtml = useMemo(() => {
    return md(markdown);
  }, [markdown]);

  async function sendNewsletter() {
    setStatus("");

    if (!scriptUrl.trim()) {
      setStatus("Paste your Apps Script /exec URL.");
      return;
    }

    if (!secret.trim()) {
      setStatus("Enter the newsletter sender token.");
      return;
    }

    if (!subject.trim()) {
      setStatus("Enter an email subject.");
      return;
    }

    if (!markdown.trim()) {
      setStatus("Write something for the newsletter.");
      return;
    }

    const confirmed = window.confirm("Send this newsletter to every verified subscriber?");

    if (!confirmed) return;

    setSending(true);

    try {
      const html = md(markdown);

      const text = markdown
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)");

      const payload = {
        subject: subject.trim(),
        title: title.trim(),
        html,
        text,
        postUrl: postUrl.trim(),
      };

      const body = new URLSearchParams({
        action: "sendNewsletter",
        secret: secret.trim(),
        payload: JSON.stringify(payload),
      });

      const response = await fetch(scriptUrl.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
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

      if (details) {
        setStatus(
          `Sent: ${details.sent} • Skipped: ${details.skipped} • Failed: ${details.failed}`,
        );
      } else {
        setStatus("Newsletter sent successfully.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong while sending.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Send Newsletter</h1>
          <p className="mt-2 text-zinc-500">Create and send a HackGwinnett newsletter.</p>
        </div>

        {status && (
          <div className="mb-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            {status}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Apps Script</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Apps Script /exec URL
              </label>
              <input
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Sender token</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Paste sender token"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold">Newsletter</h2>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-zinc-700">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="HackGwinnett Weekly"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-zinc-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's happening at HackGwinnett?"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Post URL
                <span className="ml-2 font-normal text-zinc-400">optional</span>
              </label>
              <input
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://hackgwinnett.org/news/..."
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Markdown</label>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[500px] w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-zinc-400"
                placeholder="# Hello!"
              />
            </div>

            <button
              type="button"
              disabled={sending}
              onClick={sendNewsletter}
              className="mt-5 w-full rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Newsletter"}
            </button>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-zinc-100 p-4">
            <div className="mb-3 px-2 text-sm font-medium text-zinc-500">Preview</div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-center bg-zinc-900 px-6 py-8">
                <img src="/favicon.png" alt="HackGwinnett" className="max-h-16 max-w-[220px]" />
              </div>

              <div className="px-8 py-10">
                {title && <h1 className="mb-6 text-3xl font-bold text-zinc-900">{title}</h1>}

                <div
                  className="prose prose-zinc max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: String(previewHtml),
                  }}
                />

                {postUrl && (
                  <div className="mt-8">
                    <a
                      href={postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg bg-zinc-900 px-5 py-3 font-semibold text-white"
                    >
                      Read on HackGwinnett →
                    </a>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 bg-zinc-50 px-8 py-8 text-center">
                <p className="mb-4 text-xs leading-5 text-zinc-500">
                  You're receiving this email because you subscribed to the HackGwinnett newsletter.
                </p>

                <div className="mb-4 flex justify-center gap-5 text-sm">
                  <a
                    href="https://hackgwinnett.org/go/instagram"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-zinc-900"
                  >
                    Instagram
                  </a>

                  <a
                    href="https://hackgwinnett.org/go/youtube"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-zinc-900"
                  >
                    YouTube
                  </a>

                  <a
                    href="https://hackgwinnett.org/go/x"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-zinc-900"
                  >
                    X
                  </a>
                </div>

                <span className="text-xs text-zinc-500">Unsubscribe</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
