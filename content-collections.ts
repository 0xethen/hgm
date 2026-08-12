import { defineConfig } from "@content-collections/core";
import { postsCollection as posts } from "cms/config";
import { pagesCollection as pages } from "cms/config";

export default defineConfig({
  content: [posts, pages],
});
