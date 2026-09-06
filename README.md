### www

The repository for the official HackGwinnett marketing website ([hackgwinnett.org](https://hackgwinnett.org))

Non-contributors, **please report issues at [hackgwinnett.org/go/issues](https://hackgwinnett.org/go/issues)**

> **TODOs:**
>
> - Media Gallery (officer input required)
> - Investigate what percentage of visitors have trouble with the anchor-positioning/popover behavior in older Firefox (yes, we use anchored popovers instead of getBoundingClientRect() for the register tooltip!)
> - YAY! Taskade's sponsor logo (taskade-v2.svg) is FIXED! (it used a <pattern>+<use> raster-embedding trick that broke WebKit)
> - move to base-ui toast instead of sonner
> - [needs heavy input] sender.tsx and actual sender should use shared email template

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
