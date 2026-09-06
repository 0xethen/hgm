#!/usr/bin/env bash
# [vibe]
# Pushes a fixed allowlist of values from your local .env into this repo's "pages" GitHub
# Actions environment (Settings > Environments > pages), so a value you've already set up
# locally doesn't also have to be retyped by hand into the GitHub UI.
#
# This script is opt-in and installs nothing on its own — see CONTRIBUTING.md for how to wire
# it up as a pre-push hook, if you want it to run automatically.
#
# Wired up as pre-push (not post-commit): git feeds this the refs about to be pushed, so it
# only actually syncs when `main` is one of them — the branch deploy.yml watches — instead of
# firing on every local commit to some WIP branch that may never reach main. It also NEVER
# fails the push over a sync issue: gh missing, not authenticated, a network hiccup, or the
# `gh variable set` call itself failing are all logged and swallowed, not turned into a
# nonzero exit, since none of that has anything to do with whether your code is safe to push.
#
# Deliberately an ALLOWLIST, not "upload everything in .env": a new secret you add to your
# local .env later (e.g. the newsletter sender's secret — see docs/NEWSLETTER.md) must NEVER
# end up here just because it exists. A key only gets pushed if it's added below on purpose,
# which should only happen for values that are safe to be public once the site is built.
# Keep this list in sync with EXPECTED_ENV in build.ts.

ENV_FILE=".env"
GH_ENVIRONMENT="pages"

ALLOWED_KEYS=(
  "PUBLIC_APPS_SCRIPT_NEWSLETTER_URL"
)

log() {
  echo "[sync-env] $1"
}

sync_env() {
  cd "$(git rev-parse --show-toplevel)" || return 0

  if [ ! -f "$ENV_FILE" ]; then
    log "no $ENV_FILE found, nothing to sync!"
    return 0
  fi

  if ! command -v gh >/dev/null 2>&1; then
    log "gh CLI not found! please install it: https://cli.github.com"
    return 0
  fi

  if ! gh auth status >/dev/null 2>&1; then
    log "gh is not authenticated! please log in: \`gh auth login\`)"
    return 0
  fi

  for key in "${ALLOWED_KEYS[@]}"; do
    # last matching, non-commented "KEY=value" line in .env
    line=$(grep -E "^${key}=" "$ENV_FILE" | tail -n1)

    if [ -z "$line" ]; then
      log "$key not set in $ENV_FILE, skipping..."
      continue
    fi

    value="${line#*=}"

    if [ -z "$value" ]; then
      log "$key is blank in $ENV_FILE, skipping..."
      continue
    fi

    log "setting $key on the \"$GH_ENVIRONMENT\" environment..."
    if ! gh variable set "$key" --env "$GH_ENVIRONMENT" --body "$value"; then
      log "failed to set $key (not blocking your push over it though)"
    fi
  done

  log "done! :)"
}

# Pre-push passes <remote-name> <remote-url> as args and pipes one
# "<local-ref> <local-sha> <remote-ref> <remote-sha>" line per pushed ref over stdin — that's
# how we tell "this is a real pre-push invocation" from "someone ran the script by hand".
if [ "$#" -ge 2 ] && [ ! -t 0 ]; then
  pushing_main=false

  while read -r local_ref local_sha remote_ref remote_sha; do
    if [ "$remote_ref" = "refs/heads/main" ]; then
      pushing_main=true
    fi
  done

  if [ "$pushing_main" = true ]; then
    sync_env
  else
    log "not pushing main, skipping."
  fi
else
  # run by hand (not as a git hook): always sync
  sync_env
fi

# never fail the push over anything that happened above
exit 0
