# Hosting

## Post-build

You now have a built application at `dist/`. During [postbuild step](build.js#L16), we keep the `client` generated directory and remove the `server` generated directory--in theory, we'll only need the `client`, so we move it to the parent (`dist`). Our configuration [(vite.config.ts)](vite.config.ts) uses TanStack Start's [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode) with static prerendering [(**SEE BELOW**)](#i-chose-spa-now-what). Assuming everything is configured correctly (no server functions or API routes allowed!), the `server` directory should be unnecessary for GitHub Pages!

If things go haywire, you may need to switch to a deployment adapter that supports server-side stuff (like Vercel or Netlify). **If you do that**, please change the [(vite.config.ts)](vite.config.ts): remove references to `spa` and `prerender` in the TanStack Start plugin. Make sure to run `vpr server-build` instead of `vpr static-build` to build the server-enabled artifact. Then, upload the `dist` folder to your deployment provider.

> **IMPORTANT: STATIC PRERENDERING IS NOT THE SAME AS SSR.** This can cause unexpected behavior--for example, going to a post author route (/posts/@author) will not work if during build-time, there's no way to get to that author. So if the author has no posts, they will never be linked to on the /posts/(postId) page, and thus /posts/@author-with-no-posts will not be prerendered (resulting in a 404 in prod). You will see what routes are prerendered during build-time in the output of `vpr static-build`:

```
[prerender] Prerendering pages...
[prerender] Concurrency: 10
[prerender] Crawling: /
[prerender] Crawling: /posts
[prerender] Crawling: /about
[prerender] Crawling: /posts/new-hg-website
...
```

> use this to find bugs. Because this is all very pre-release & experimental stuff, using a server-side deployment adapter (like Vercel or Netlify) is highly recommended.

Locally, you'll have to build the web app first [(see above)](#build). Then upload the finished `dist` artifact onto your deployment provider. You may need to make some tweaks (like pointing assets and [setting the base path](https://tanstack.com/router/latest/docs/how-to/deploy-to-production#github-pages) to /(repository-name) for `*.github.io` GitHub Pages). Look it up!

## I chose SPA. Now what?

IF YOU CHOOSE TO USE SINGLE PAGE APP MODE WHERE JS FULLY HYDRATES THE PAGE (with or without static prerendering) SEE BELOW FOR AN AI RESPONSE ON HOW TO HANDLE SERVER-SIDE STUFF REGARDLESS!

---

### Redirecting `/_serverFn` to a Different Origin

#### Option 1: Custom Global Fetch (Client-Side)

You can intercept all server function calls on the client by providing a custom `fetch` implementation via `createStart`. This lets you rewrite the URL before the request is made:

```ts
// src/start.ts
import { createStart } from "@tanstack/react-start";
import type { CustomFetch } from "@tanstack/react-start";

const serverFetch: CustomFetch = async (url, init) => {
  // Rewrite /_serverFn/* calls to your server subdomain
  const rewritten = url.toString().replace(/^\/_serverFn/, "https://server.mydomain.com/_serverFn");
  return fetch(rewritten, init);
};

export const startInstance = createStart(() => ({
  serverFns: {
    fetch: serverFetch,
  },
}));
```

> **Note:** Custom fetch only applies on the client side. During SSR, server functions are called directly without going through fetch. [[Fetch Override Precedence](https://tanstack.com/start/latest/docs/framework/react/guide/middleware#fetch-override-precedence)]

#### Option 2: CDN/Proxy-Level Redirect

If you're deploying to a CDN (e.g., Netlify), you can proxy `/_serverFn/*` requests to your server subdomain at the infrastructure level. Using Netlify's `_redirects` as an example:

```plaintext
/_serverFn/* https://server.mydomain.com/_serverFn/:splat 200
/* /_shell.html 200
```

This is the approach the docs recommend for routing server function traffic through to a server in SPA mode. [[Allowing Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode#allowing-server-functions-and-server-routes)]

#### Important Caveat: CSRF / CORS

Since server functions enforce same-origin checks by default, calling them from a different origin (`server.mydomain.com`) will be blocked unless you configure the CSRF middleware to allow your public origin:

```ts
createCsrfMiddleware({ origin: "https://app.mydomain.com" });
```

[[Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)]

---

**The CDN/proxy approach (Option 2) is likely the cleanest** for a static SPA deployment, as it keeps the client code unchanged and handles routing at the infrastructure level. The custom fetch approach (Option 1) works if you need to do it purely in code.
