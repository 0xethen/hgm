// eslint-disable-next-line no-restricted-imports
import { allPosts as ccPosts } from "content-collections";
import { authorInfo, type Author } from "cms/posts/authors";

export const posts = ccPosts
  .filter((p) => !p.hidden)
  .sort((a, b) => b.date - a.date)
  .map((p) => ({
    ...p,
    date: new Date(p.date),
    cover: {
      ...p.cover,
      src: p.cover?.src.startsWith("/") ? p.cover.src.toAsset() : p.cover?.src, // add base path (/www or repo name) if using GH Pages
    },
    authors: p.authors.map((id: string) => ({ id, ...authorInfo[id] })) as Author[],
  }));
