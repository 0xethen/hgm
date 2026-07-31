import { defineConfig } from "@content-collections/core";
import { postsCollection as posts } from "cms/config";

export default defineConfig({
  content: [posts],
});
