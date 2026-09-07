### www

The repository for the official HackGwinnett marketing website ([hackgwinnett.org](https://hackgwinnett.org))

Non-contributors, **please report issues at [hackgwinnett.org/go/issues](https://hackgwinnett.org/go/issues)**

> **TODOs:**
>
> - Media Gallery (officer input required)
> - Investigate what percentage of visitors have trouble with the anchor-positioning/popover behavior in older Firefox (yes, we use anchored popovers instead of getBoundingClientRect() for the register tooltip!)
> - YAY! Taskade's sponsor logo (taskade-v2.svg) is FIXED! (it used a <pattern>+<use> raster-embedding trick that broke WebKit)
> - [needs heavy input] sender.tsx and actual sender should use shared email template
> - investigate overlap between low power mode output on Safari with reduce-motion. does it set reduce-motion to true on page load then to false immediately? bc there's some interesting behavior
> - the SECOND nested div in the rendered scroller output (.vault/RENDERED_SCROLLER_EXAMPLE.html) has links that don't work in safari. on hover there is no link (default cursor, doesn't light up on hover, doesn't lead to a link even though there's a valid <a href>. pointer-events-none issue maybe?)
> - CRITICAL: Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>. I got that randomly (can't remember what I was doing) on the homepage. Causes a BSOD (ErrorBoundary). Must have something to do with the video.
> - clicking on the video dialog makes ESC not work because we're focused on the youtube video. maybe on the youtube iframe add a listener for ESC which changes focus to the close button? and on the close button ESC would work so u would js do escape twice to exit
> - CRITICAL!!!: links in emails that lead to https://script.google.com /macros (e.g. verify or unsubscribe) DO NOT WORK ON MOBILE. it says "Page Not Found" (Sorry, unable to open the file at this time) on mobile but brings me to the html perfectly fine on desktop. no clue why (https://script.google.com/macros/s/AKfycbwBHl-l18b-sQYFsiuGjpezk3f4ZqoY9VBaq1TC-WjFh9Fmqo7Yh-y-bzYIjX9VPj9E/exec?unsubscribe=62ba9b9c-8498-4f79-9c4b-e16da32e428a (email Unsubscribe link) -> https://script.google.com/macros/u/6/s/AKfycbwBHl-l18b-sQYFsiuGjpezk3f4ZqoY9VBaq1TC-WjFh9Fmqo7Yh-y-bzYIjX9VPj9E/exec?unsubscribe=17bab3f3-09d1-462d-a318-ae29a2d0eb21 (what it takes me to in safari, probably looking for an authenticated user that can access it even though everyone can because it works perfectly fine on everyone's desktop)). it works when i press and hold the link to open the preview weirdly enough
> - use view transitions/css transitions and/or motion/react (framer-motion) to quickly animate between sponsors grid and scroller. grid->scroller: squeeze and overlap fade over each other. scroller->grid: stretch and overlap fade

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
