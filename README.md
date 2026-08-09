### www

The repository for the official HackGwinnett marketing website (https://hackgwinnett.org)

> TODO: `git remote remove origin && git remote add origin https://github.com/hackgwinnett/www.git`

> TODO: resize images so that they don't take 3 years to load

## Contributing

Before you commit: for more info on how to (correctly) create posts, the committing guidelines, and more, please see [CONTRIBUTING](CONTRIBUTING.md)

> If you're bored, try resolving (or removing) one of the many // TODOs in the codebase. If you do, please submit a PR and a senior officer should review it. Spam them! Thanks!!!

> If you need help with something, do not hesitate to DM Ethen on Discord (HackGwinnett officers should have my user). Make sure to send proof you're not an impostor or I probably won't take a look at it.

## Develop and Deploy

> We use Vite+, the super-cool next-generation unified tooling system. [Or whatever.](#about-vite)

### Development

`vpr dev`

> `vpr` is an alias for `vp run`. It is NOT the same as `vp`... do not run `vp dev` alone

You did it! Now, content-collections is watching for CMS changes AND your dev server is live at port `3000`. Make any changes you want and see them propagate live with Vite.

### Build

`vpr static-build` (or `vpr server-build` for server-enabled*) (or `vpr local-build` locally)

> `vpr` is an alias for `vp run`. It is NOT the same as `vp`... do not run `vp build` alone

*YOU **MUST MUST MUST** READ [HOSTING.md](./docs/HOSTING.md) for instructions on how to deploy the build artifact to your hosting provider. The build artifact is located in `dist/` after a successful build.

### Deploy

READ [HOSTING.md](./docs/HOSTING.md) for more. For right now:

The GitHub Action ([deploy.yaml](./.github/workflows/deploy.yaml)) should handle building and deploying for you on commit to `main`. Boom. Deployed.

### About Vite+

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

---

_Made with 🤓 by [Ethen Tseggai](https://github.com/0xethen)_
