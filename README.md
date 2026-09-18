### www

The repository for the official HackGwinnett marketing website ([hackgwinnett.org](https://hackgwinnett.org))

Non-contributors, **please report issues at [hackgwinnett.org/go/issues](https://hackgwinnett.org/go/issues?ref=readme)**

> **TODOs:**
>
> - Media Gallery (officer input required)
> - Investigate what percentage of visitors have trouble with the anchor-positioning/popover behavior in older Firefox (yes, we use anchored popovers instead of getBoundingClientRect() for the register tooltip!) — needs real analytics/device data we don't have yet, not actionable from code alone
> - RESOLVED (2026-09-18): sender.tsx and actual sender should use shared email template — `src/lib/newsletter/template.ts` is now the one copy; `/a/sender`'s preview renders its real output directly (byte-accurate, no more hand-coded Tailwind mockup). `pnpm sync:newsletter-template` produces a plain-JS copy to paste into the Apps Script Sender project — see "Keeping the email template in sync" in docs/NEWSLETTER.md for the one-time integration (manual, since Apps Script needs a human to paste it in).
> - investigate overlap between low power mode output on Safari with reduce-motion. does it set reduce-motion to true on page load then to false immediately? bc there's some interesting behavior — needs a real Mac/iOS device in low power mode to chase, can't reproduce without one
> - RESOLVED (2026-09-18): the SECOND nested div in the rendered scroller output has links that don't work in safari — this is intentional, not a bug. That div is the decorative "seam" copy of the marquee (`aria-hidden inert` in `scroller.tsx`), duplicated purely so the CSS-animation loop has no visible seam; it's deliberately non-interactive in every browser. No fix needed.
> - RESOLVED (2026-09-18): CRITICAL: Base UI: DialogRootContext is missing — traced the commented-out redundant `<DialogClose>` in `video.tsx` back to the project's very first commit (it was never live code, so it wasn't the cause) and removed it as dead-code cleanup. Repeatedly opened/closed/escaped the video dialog via browser automation (including from inside the iframe) and couldn't reproduce a crash or any console error. Leaving this closed since it's unreproduced after real testing; reopen with exact repro steps if it happens again.
> - RESOLVED (2026-09-18): clicking on the video dialog makes ESC not work — reproduced via browser automation: once the YouTube iframe has real DOM focus, Escape never reaches the page at all (0, 1, or 100 presses — cross-origin iframes fully own their own keyboard input, there's no JS API to intercept it from the parent, so the iframe-side "add an ESC listener" idea in the original note isn't actually possible). That said, the dialog isn't trapped: clicking anywhere on the backdrop, or the always-visible × button (neither requires focus to have left the iframe), closes it in one action — confirmed working. No code fix exists for the Escape case specifically; this is a hard browser platform limitation, not a bug in our code.
> - CRITICAL!!!: links in emails that lead to https://script.google.com /macros (e.g. verify or unsubscribe) DO NOT WORK ON MOBILE. it says "Page Not Found" (Sorry, unable to open the file at this time) on mobile but brings me to the html perfectly fine on desktop. no clue why (https://script.google.com/macros/s/AK[...]/exec?unsubscribe=62ba9b9c-8498-4f79-9c4b-e16da32e428a (email Unsubscribe link) -> https://script.google.com/macros/u/3 (earlier it was 6)/s/[...]/exec?unsubscribe=62ba9b9c-8498-4f79-9c4b-e16da32e428a (what it takes me to in safari, probably looking for an authenticated user that can access it even though everyone can because it works perfectly fine on everyone's desktop)). it works when i press and hold the link to open the preview weirdly enough — likely a known script.google.com/macros quirk in mobile in-app browsers/webviews rather than something in our code; moving verify/unsubscribe off script.google.com entirely (see the newsletter options writeup) would sidestep it for good
> - use view transitions/css transitions and/or motion/react (framer-motion) to quickly animate between sponsors grid and scroller. grid->scroller: squeeze and overlap fade over each other. scroller->grid: stretch and overlap fade — deferred, real design/animation work better done as its own pass

## Contributing

Before you commit: for more info on how to (correctly) create posts, the committing guidelines, and more, please see [CONTRIBUTING](CONTRIBUTING.md).

If you need help with something, do not hesitate to DM Ethen on Discord (HackGwinnett officers should have my user). Make sure to send proof you're not an impostor or I probably won't take a look at it.

## Develop and Deploy

We use Vite+, the super-cool next-generation unified tooling system. [Or whatever.](#about-vite)

### Development

`vpr dev`

`vpr` is an alias for `vp run`. It is NOT the same as `vp`... do not run `vp dev` alone

You did it! Now, content-collections is watching for CMS changes AND your dev server is live at port `3000`. Make any changes you want and see them propagate live with Vite.

### Build

`vpr build-static` (or `vpr build-server` for server-enabled*) (or `vpr build-local` locally)

`vpr` is an alias for `vp run`. It is NOT the same as `vp`... do not run `vp build` alone

*YOU **MUST MUST MUST** READ [HOSTING.md](./docs/HOSTING.md) for instructions on how to deploy the build artifact to your hosting provider. The build artifact is located in `dist/` after a successful build.

### Deploy

READ [HOSTING.md](./docs/HOSTING.md) for more. For right now:

The GitHub Action ([deploy.yml](./.github/workflows/deploy.yml)) should handle building and deploying for you on commit to `main`. Boom. Deployed. Use `[skip ci]` in your commit message to skip the build and deploy step for commits that don't need it (like documentation changes).

### About Vite+

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

---

_Made with_ 🤓 _by [Ethen Tseggai](https://github.com/0xethen)_
