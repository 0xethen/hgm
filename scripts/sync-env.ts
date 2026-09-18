// [vibe]
// Pushes a fixed allowlist of values from your local .env into this repo's "pages" GitHub
// Actions environment (Settings > Environments > pages), so a value you've already set up
// locally doesn't also have to be retyped by hand into the GitHub UI.
//
// This script is opt-in and installs nothing on its own — see CONTRIBUTING.md for how to wire
// it up as a pre-push hook, if you want it to run automatically.
//
// Wired up as pre-push (not post-commit): git feeds this the refs about to be pushed, so it
// only actually syncs when `main` is one of them — the branch deploy.yml watches — instead of
// firing on every local commit to some WIP branch that may never reach main. It also NEVER
// fails the push over a sync issue: gh missing, not authenticated, a network hiccup, or the
// `gh variable set` call itself failing are all logged and swallowed, not turned into a
// nonzero exit, since none of that has anything to do with whether your code is safe to push.
//
// Deliberately an ALLOWLIST, not "upload everything in .env": a new secret you add to your
// local .env later (e.g. the newsletter sender's secret — see docs/NEWSLETTER.md) must NEVER
// end up here just because it exists. A key only gets pushed if it's added below on purpose,
// which should only happen for values that are safe to be public once the site is built.
// Keep this list in sync with EXPECTED_ENV in build.ts.
//
// Run by hand with: node scripts/sync-env.ts (vpr sync:env / pnpm sync:env) — see
// CONTRIBUTING.md for wiring it up as a pre-push hook instead.

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { join } from "node:path";

const ENV_FILE = ".env";
const GH_ENVIRONMENT = "pages";

const ALLOWED_KEYS = ["PUBLIC_APPS_SCRIPT_NEWSLETTER_URL", "PUBLIC_GOATCOUNTER_URL"];

function log(message: string): void {
  console.log(`[sync-env] ${message}`);
}

function repoRoot(): string {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf-8" }).trim();
  } catch {
    return process.cwd();
  }
}

function commandExists(command: string, ...args: string[]): boolean {
  try {
    execFileSync(command, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** value out of a raw "KEY=value" line, stripping one layer of surrounding quotes */
function parseEnvValue(line: string, key: string): string | null {
  const raw = line.slice(key.length + 1);
  const quoted = /^"(.*)"$/.exec(raw) || /^'(.*)'$/.exec(raw);
  const value = quoted ? quoted[1] : raw;
  return value ? value : null;
}

async function syncEnv(): Promise<void> {
  const root = repoRoot();
  const envPath = join(root, ENV_FILE);

  if (!existsSync(envPath)) {
    log(`no ${ENV_FILE} found, nothing to sync!`);
    return;
  }

  if (!commandExists("gh", "--version")) {
    log("gh CLI not found! please install it: https://cli.github.com");
    return;
  }

  if (!commandExists("gh", "auth", "status")) {
    log("gh is not authenticated! please log in: `gh auth login`)");
    return;
  }

  const lines = (await readFile(envPath, "utf-8")).split("\n");

  for (const key of ALLOWED_KEYS) {
    // last matching, non-commented "KEY=value" line in .env
    const line = lines.filter((l) => l.startsWith(`${key}=`)).at(-1);

    if (!line) {
      log(`${key} not set in ${ENV_FILE}, skipping...`);
      continue;
    }

    const value = parseEnvValue(line, key);
    if (!value) {
      log(`${key} is blank in ${ENV_FILE}, skipping...`);
      continue;
    }

    log(`setting ${key} on the "${GH_ENVIRONMENT}" environment...`);
    try {
      execFileSync("gh", ["variable", "set", key, "--env", GH_ENVIRONMENT, "--body", value], {
        cwd: root,
        stdio: "ignore",
      });
    } catch {
      log(
        `failed to set ${key} (push will still succeed, but you may need to run \`gh variable set\` by hand)`,
      );
    }
  }

  log("done! :)");
}

async function readStdinLines(): Promise<Array<string>> {
  const rl = createInterface({ input: process.stdin });
  const lines: Array<string> = [];
  for await (const line of rl) lines.push(line);
  return lines;
}

async function main(): Promise<void> {
  // Pre-push passes <remote-name> <remote-url> as args and pipes one
  // "<local-ref> <local-sha> <remote-ref> <remote-sha>" line per pushed ref over stdin.
  // If this isn't present, we're being run by hand (not as a git hook) and should always sync.
  const invokedAsHook = process.argv.length - 2 >= 2 && !process.stdin.isTTY;

  if (!invokedAsHook) return syncEnv();

  const refLines = await readStdinLines();
  const pushingMain = refLines.some((line) => line.split(" ")[2] === "refs/heads/main");

  if (pushingMain) {
    await syncEnv();
  } else {
    log("not pushing main, skipping.");
  }
}

main()
  .catch((error: unknown) => {
    // never fail the push over anything that happened above
    log(`unexpected error, ignoring: ${error instanceof Error ? error.message : String(error)}`);
  })
  .finally(() => process.exit(0));
