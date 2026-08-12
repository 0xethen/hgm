# Contributing

> As of right now, HackGwinnett's marketing website repository (www) is public.

Your commit messages should have at least 1 (one) of the following prefixes:

| Prefix   | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| [site]   | Contributions relating to the site source code (e.g. adding a route) |
| [docs]   | Adding a post to the CMS/content-collections (cms/posts)             |
| [feat]   | Major overhauls to site                                              |
| [hotfix] | Quick fix/enhancement to one or more site bugs                       |

## General code patterns

When adding static assets like images, sound, etc. to the site, call the .toAsset() string function on the src path. For example, `<img src={"/assets/images/misc/jadensideeye.png".toAsset()} />` in [LilJadenJr](./src/components/elements/misc/LilJadenJr.tsx#58).

## Routes (webpages)

Routes are defined in the `src/routes` directory. Each route is a separate file that defines the component to be rendered for that route. See the Start [Routing guide](https://tanstack.com/start/latest/docs/framework/react/guide/routing) for more information.

It is SUPER IMPORTANT that you also follow the [Generative Engine Optimization (GEO)](https://tanstack.com/start/latest/docs/framework/react/guide/geo) guide found here, too! Per Ms. R, we are ChatGPT famous!

![Email from Ms. Rachkovskiy, subject: "HackGwinnett is ChatGPT famous!"](./public/assets/misc/Screenshot 2026-07-21 at 5.23.40 PM.png)

Many of our participants claim they found us while searching for CS opportunities via ChatGPT (or another LLM), so we need to make our website as scrapable as we can. Ideally, it would be server-side rendered (SSR), but because `www` is a simple marketing website that should not have that many resources allocated to it, this project is statically generated (SSG) (see [HOSTING.md](./docs/HOSTING.md) and (optionally) the TanStack documentation on [SPA Mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode) and [Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)).

## Posts

> Any posts that do NOT follow the schema in [cms/config.ts](cms/config.ts) will **not show up** on the website. If you are adding a new post, please include the frontmatter (correctly!). You can read more about it below.

> **IMPORTANT:** When making changes to the internal blog source code (`posts/index.tsx`, `posts/post.$slug.tsx`, etc), NEVER, under ANY CIRCUMSTANCES, get posts via:

```tsx
import { ... } from "content-collections";
```

> Post/author-related stuff should only be imported from `"cms"`, `"cms/posts"`, `"cms/pages"`, etc. There is rarely a time when you need to be importing raw post data from `"content-collections"`.

### Introduction

Unlike traditional CMS systems, there is no dedicated UI in our website for managing posts--it's all in the source code. This is good for many reasons; some of which include:

- No need to maintain a CMS
- I don't have to maintain a CMS
- We are a team of eight and don't need a CMS

_Honestly, we rarely put out posts anyway._

### Directory structure

So here's how it works:

- [`cms/posts`](cms/posts) folder
  - This is where every post, stored as a Markdown (`.md`) file, is stored.

- [`cms/posts.ts`](cms/posts.ts) file
  - This is where post data is transformed to be compatible with our web routes. Usually, you won't need to touch this.

- [`cms/authors.ts`](cms/authors.ts) file
  - This is where author details are stored. Unless you need to add a new author, you probably won't need to touch this.

  - It is important--nay, IMPERATIVE--that you ALWAYS specify authors that ACTUALLY have a key in [`authors.ts`](cms/authors.ts) (and all the appropriate data).

  - If this condition, or anything prop conforming to the [schema](./cms/config.ts), is not met, either a) the post will not show up on the website or b) the website will fail to build/compile and, therefore, the deployment step literally cannot run.

  - _Note: this was originally a JSON file, which was annoying because I couldn't type it. I very quickly converted it to a TypeScript file, but if there's any little JSON leftovers, please lmk ASAP_

- [`content-collections.ts`](./cms/config.ts) file
  - Configuration for content-collections

  - To modify (add/remove/change type of) metadata for **every post**, edit the Zod schema present in this file

  - > The build step requires frontmatter (metadata) from ALL posts to match the schema present in [cms/config.ts](./cms/config.ts) (exported to [content-collections.ts](content-collections.ts)). If you _must_ change the metadata schema, it is your responsibility to alert your fellow officers and edit all existing posts

- `.content-collections` folder (locally)
  - When running the `vpr dev` script, you'll notice a .content-collections folder. This is where all the auto-generated nerdy code is that turns it into real code under the hood.
  - There's no need to worry about this folder, but if it doesn't show up _you are doing something wrong_!
  - Most likely, you did `vp dev` (which only ran the dev server) instead of `vp run dev` or `vpr dev` (which ran the dev script in `package.json`, whcih concurrently runs the content-collections stuff for you)

Alright, enough yap. Here's what you've been waiting for:

### Post structure

At the top of every post is the frontmatter, which serves as metadata for the website:

```md
---
title: "React Compiler is getting a Rust slopfork"
authors: ["ethen"]
date: 1781016713527 # to get the current timestamp, run `node -e "console.log(Date.now())"` in your terminal
summary: "The jury's still out on whether it'll be reviewed thoroughly"
cover:
  {
    src: "/assets/covers/cookies.png",
    alt: "A plate of cookies my grandma made me. They were delicious.",
  }
tags:
  - "react"
  - "www"
  - "news"
---
```

(again, the schema (effectively types) for everything can be found in [cms/config.ts](./cms/config.ts). If it gets confusing, you can look at [any](cms/posts/new-website-announcement.md) [other](cms/posts/hg6-sneak-peek-1-workshops.md) (complete) [post](cms/posts/summer-workshops-with-peach-state-2026.md) for help.)

Notice how the `authors` property is an array set to [`ethen`] instead of a full government name? Take a look at [`authors.ts`](cms/authors.ts#11):

```ts
export const authorInfo: AuthorDetail = {
  ethen: {
    name: "Ethen",
    bio: "enjoys water and long walks on the beach",
    avatar: "/assets/posts/avatars/0xethen.png",
    socials: [
      { platform: "Instagram", url: "https://instagram.com/ethentseggai" },
      // { platform: "Twitter", url: "..." } and here's where I'd put my Twitter... IF I HAD ONE!
    ],
    officer: true,
  },
  // ...
};
```

"ethen" is the authorId, used as a key to my details in authorsRaw. The `authors` attribute is an array in order from **most contributed to least contributed**, like research papers. This way, on any given post, the first name that shows up will link to the author with the most contributions to the article.

---

The rest (you know, the actual "writing") is up to you. Remember, it's a **Markdown (`.md`) file**, so there's a lot of formatting to your disposal. You're probably familiar with writing in Markdown (heard of Discord?), but in case you get stuck:

- check out [this cheat sheet](https://www.markdownguide.org/basic-syntax/)
- look up a tutorial on [YouTube](https://www.youtube.com/results?search_query=markdown+tutorial)
- or ask another friendly officer :)

Happy writing! ✍️

---

> [Ethen](https://github.com/0xethen) wrote this very detailed, very thorough, very well-documented documentation with his own two hands! If at any point in time you were to send him a thank you card... or a snack from the vending machine... he would probably appreciate it. just sayin'.
