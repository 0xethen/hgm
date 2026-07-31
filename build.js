// "build": "node build.js --pre && content-collections build && vp build && node build.js --post",
import { rm, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import readline from "node:readline/promises";
import { execSync } from "node:child_process";

function getGitSha() {
  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

async function preaction() {
  console.log("Preparing build...");

  const gitSha = getGitSha();
  process.env.PUBLIC_GIT_SHA = gitSha;
  console.log(`✓ Set PUBLIC_GIT_SHA=${gitSha}`);

  if (existsSync("dist")) {
    console.log("Clearing dist...");
    await rm("dist", { recursive: true, force: true });
  }

  console.log("Done!");
  return gitSha;
}

async function postaction() {
  console.log("Preparing for GitHub Pages/serve...");

  if (existsSync("dist/client/_shell.html")) {
    console.log("GH Pages/serve index rewrite workaround...");
    await cp("dist/client/_shell.html", "dist/client/index.html");
    await cp("dist/client/_shell.html", "dist/client/404.html");
  }

  console.log("Done!");
}

async function removeserver(confirmation) {
  console.log("Removing server environment (for static hosting only)...");

  if (confirmation) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await rl.question(
      'If your deployment provider must only have a client (like GitHub Pages) type "y". If having a server is okay (like Vercel), type "n". (y/N) ',
    );

    rl.close();

    if (answer.toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(1);
    }
  }

  if (existsSync("dist/server")) {
    const files = await readdir("dist/server");
    console.log(
      files.length > 0
        ? "[!] server/ directory exists and is not empty. Removing anyway..."
        : "[ ] server/ directory exists but is empty. Removing...",
    );
    await rm("dist/server", { recursive: true, force: true });
  }

  // if (existsSync("dist/client")) {
  //   console.log("Moving contents of dist/client to dist/");
  //   await cp("dist/client", "dist", { recursive: true, force: true });
  //   await rm("dist/client", { recursive: true, force: true });
  // }

  console.log("Done!");
}

async function build(noremser, remserconfirmation) {
  const gitSha = await preaction();

  console.log("Running build...");
  execSync("content-collections build", {
    stdio: "inherit",
    env: { ...process.env, PUBLIC_GIT_SHA: gitSha },
  });

  execSync("vp build", {
    stdio: "inherit",
    env: { ...process.env, PUBLIC_GIT_SHA: gitSha },
  });

  await postaction();
  if (!noremser) await removeserver(remserconfirmation);
}

const args = process.argv.slice(2);

if (args.includes("--pre")) {
  preaction().catch(console.error);
} else if (args.includes("--post")) {
  postaction().catch(console.error);
  removeserver(args.includes("--ask")).catch(console.error);
} else if (args.includes("--build")) {
  build(args.includes("--dont-remove-server"), args.includes("--ask")).catch(console.error);
} else {
  console.log("No action specified. Use --pre, --post, or --build.");
}
