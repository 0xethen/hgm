import { cp, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import readline from "node:readline/promises";

type CliFlags = {
  preOnly: boolean;
  postOnly: boolean;
  ask: boolean;
  keepServer: boolean;
};

const DIST_DIR = "dist";
const CLIENT_DIR = `${DIST_DIR}/client`;
const SERVER_DIR = `${DIST_DIR}/server`;
const SHELL_FILE = `${CLIENT_DIR}/_shell.html`;

// parsed in main()
let flags: CliFlags;

function getGitSha(): string {
  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

async function confirm(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question(prompt);
    return answer.trim().toLowerCase() === "y";
  } finally {
    rl.close();
  }
}

function run(command: string, env: NodeJS.ProcessEnv): void {
  execSync(command, {
    stdio: "inherit",
    env,
  });
}

async function preBuild(): Promise<string> {
  console.log("Preparing build...");

  const gitSha = getGitSha();
  process.env.PUBLIC_GIT_SHA = gitSha;

  console.log(`✓ Set PUBLIC_GIT_SHA=${gitSha}`);

  if (existsSync(DIST_DIR)) {
    console.log("Clearing dist...");
    await rm(DIST_DIR, { recursive: true, force: true });
  }

  console.log("Done!");

  return gitSha;
}

async function postBuild(): Promise<void> {
  if (!flags.keepServer) {
    console.log("Preparing for GitHub Pages/serve...");

    if (!existsSync(SHELL_FILE)) {
      console.log(`_shell.html not found at ${SHELL_FILE}. Skipping rewrite.`);
    } else {
      console.log("Applying GitHub Pages/serve rewrite workaround...");

      await cp(SHELL_FILE, `${CLIENT_DIR}/index.html`);
      await cp(SHELL_FILE, `${CLIENT_DIR}/404.html`);
    }
  }

  if (flags.keepServer) {
    console.log("Keeping server environment...");
  } else {
    await removeServer();
  }

  console.log("Done!");
}

async function removeServer(): Promise<void> {
  console.log("Removing server environment...");

  if (flags.ask) {
    const confirmed = await confirm(
      'If your deployment provider only supports static files (like GitHub Pages), type "y". If having a server is okay (like Vercel), type "n". (y/N) ',
    );

    if (!confirmed) {
      console.log("Aborted.");
      process.exit(1);
    }
  }

  if (!existsSync(SERVER_DIR)) {
    console.log("No server directory found. Nothing to remove.");
    return;
  }

  const files = await readdir(SERVER_DIR);

  if (files.length > 0) {
    console.log("[!] server/ directory exists and is not empty. Removing anyway...");
  } else {
    console.log("[ ] server/ directory exists but is empty. Removing...");
  }

  await rm(SERVER_DIR, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Build script
// ---------------------------------------------------------------------------

async function build(): Promise<void> {
  const gitSha = await preBuild();

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PUBLIC_GIT_SHA: gitSha,
  };

  console.log("Running build...");

  run("content-collections build", env);
  run("vp build", env);

  await postBuild();
}

// ---------------------------------------------------------------------------
// CLI manager
// ---------------------------------------------------------------------------

function parseFlags(argv: string[]): CliFlags {
  const has = (flag: string): boolean => argv.includes(flag);

  return {
    preOnly: has("--pre"),
    postOnly: has("--post"),
    ask: has("--ask"),
    keepServer: has("--keep-server"),
  };
}

async function main(): Promise<void> {
  flags = parseFlags(process.argv.slice(2));

  if (flags.preOnly) {
    await preBuild();
    return;
  }

  if (flags.postOnly) {
    await postBuild();
    return;
  }

  await build();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
