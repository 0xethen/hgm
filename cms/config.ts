import { defineCollection } from "@content-collections/core";
import { z } from "zod";
import { authorInfo } from "cms/authors";

export const postsCollection = defineCollection({
  name: "posts",
  directory: "cms/posts",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    authors: z.array(z.keyof(z.object(authorInfo))),
    date: z.number(),

    summary: z.string().optional(),
    cover: z
      .object({ src: z.string(), alt: z.string(), height: z.number().min(20).max(400).optional() })
      .optional(),
    tags: z.array(z.string().toLowerCase()).optional(),
    unlisted: z.boolean().optional(),
    hidden: z.boolean().optional(),

    content: z.string(),
  }),
});
