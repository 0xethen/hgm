# Newsletter

Two separate Apps Script web apps, both bound to the same Google Sheet (subscriber list), each
scoped to one job:

- **Subscriptions** (`.vault/test.gs`) — public, no secret. Handles signup, email verification,
  and unsubscribe. Its URL is `PUBLIC_APPS_SCRIPT_NEWSLETTER_URL` (safe to ship in the build:
  the whole point of this deployment is that anyone can call it).
- **Sender** (`.vault/subscriptions.gs`) — secret-gated. Sends the newsletter to every verified
  subscriber. Its URL + secret are **never** shipped to production; they only live in your local
  `.env` and are used by the `/a/sender` page, which itself 404s outside `vp dev`.

Why two projects instead of one: least privilege. A public endpoint that can email your whole
list would be a much bigger blast radius if its secret ever leaked.

## One-time setup (per officer who needs to send)

### 1. Get the Sender script's `/exec` URL and secret

Ask whoever administers the Apps Script project (or set it up yourself, see below) for:

- the Sender deployment's `/exec` URL
- the `NEWSLETTER_SECRET` value

If you're setting it up for the first time:

1. Open the [Apps Script project](https://script.google.com) bound to the newsletter Sheet.
2. Paste the contents of `.vault/subscriptions.gs` into a script file (create one, e.g. `Sender.gs`,
   if it doesn't exist).
3. **Project Settings → Script Properties** → add `NEWSLETTER_SECRET` with a long random value
   (e.g. generate one with `openssl rand -hex 32`).
4. **Deploy → New deployment → Web app**. Execute as "Me", access "Anyone". Deploy, then copy
   the `/exec` URL it gives you.
5. Run `authorizeMailApp_` once from the Apps Script editor (Run button) and approve the
   permission prompts — this is what lets `MailApp.sendEmail` work at all.
6. In the **Sender** project's **Project Settings → Script Properties**, add `SUBSCRIPTIONS_URL`
   set to the **Subscriptions** project's `/exec` URL (used to build unsubscribe links) — the
   script errors loudly if it's missing or malformed. This lives in Script Properties, not a
   spreadsheet cell, so a Sheet edit can't silently go stale (see the `CONFIGURATION` comment
   block at the top of `subscriptions.gs`).

### 2. Configure your local `.env`

Copy `.env.example` to `.env` (git-ignored) and fill in:

```
PUBLIC_APPS_SCRIPT_SENDER_URL=<the /exec URL from step 1.4>
PUBLIC_NEWSLETTER_SENDER_SECRET=<the NEWSLETTER_SECRET value from step 1.3>
PUBLIC_NEWSLETTER_TEST_EMAIL=<your own email, for the "send test" button>
```

**Do not add these three to the `pages` GitHub environment**, unlike
`PUBLIC_APPS_SCRIPT_NEWSLETTER_URL` above. `PUBLIC_` is otherwise this repo's signal for "safe
to bake into the build" (see `docs/HOSTING.md`) — that's true for the subscribe URL, but the
sender secret must only ever live in your local `.env`. `build.ts`'s `EXPECTED_ENV` list only
checks for `PUBLIC_APPS_SCRIPT_NEWSLETTER_URL`, so nothing in the build pipeline reads these
three today, and `/a/sender` itself 404s outside `vp dev` — keep both of those true.

### 3. Send

`vp dev`, go to `/a/sender`. The Apps Script URL/secret/test-email fields pre-fill from your
`.env` (still editable if you're using a different deployment locally). The subscriber-count
tiles and the "send test to yourself" button both call the Sender script too, so you can sanity
check before the real send.

## What changed from the original version

- **Brute-force lockout**: 5 failed secret attempts locks the endpoint for 15 minutes
  (`checkAuth_` in `subscriptions.gs`, via `PropertiesService`). Previously there was no rate
  limiting on a public, secret-gated endpoint.
- **Send Log**: every send attempt (success or failure) appends a row to a new "Send Log" sheet
  tab — timestamp, subject, sent/skipped/failed counts, raw result — so there's an audit trail
  without needing a login system in front of the endpoint.
- **Test sends**: `action=testSend` emails only one address (never touches the subscriber list),
  used by the "send test to yourself" button.
- **Resumable sends**: Apps Script kills executions after ~6 minutes. A subscriber list large
  enough to hit that limit used to just die mid-send with no record of who was (or wasn't)
  mailed. The server now stops with time to spare and returns `resumeFrom`; the sender page
  automatically keeps calling until the whole list is done, showing progress as it goes.
- **Retry + dedupe**: one retry on a transient `MailApp` failure before counting a recipient as
  failed, and duplicate rows for the same email in the sheet are now sent to once, not twice.
- **`/a/sender` is no longer shipped to production.** It used to be a real page on
  `hackgwinnett.org` gated only by knowing the secret; now it doesn't exist outside `vp dev`.
