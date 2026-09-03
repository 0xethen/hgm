import { Link } from "@tanstack/react-router";
import { RiAiGenerateText, RiArrowRightLine } from "@remixicon/react";
import type { posts as everyPost } from "cms/posts/posts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";

export type Post = (typeof everyPost)[number];

const EXCERPT_LENGTH = 180; // line-clamp-2 overrides it to two lines max (visually) in the CSS

export function getExcerpt(post: Post): string {
  return (
    post.content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*]\([^)]+\)/g, "")
      .replace(/\[[^\]]+]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_>~-]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, EXCERPT_LENGTH)
      .trimEnd() + "..."
  );
}

/** one post, as a list row. every post-listing surface (browse, tags, an author's posts) shares it */
export function PostRenderer({ post }: { post: Post }) {
  return (
    <Item
      size="sm"
      variant="outline"
      render={<Link to="/posts/$postId" params={{ postId: post._meta.path.slugify() }} />}
      className="group items-start"
    >
      <ItemMedia variant="image" className="size-14 self-center">
        <img
          src={post.cover?.src || "/assets/posts/covers/default.png".toAsset()}
          alt={post.cover?.alt ?? ""}
        />
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="text-base font-semibold normal-case transition-colors group-hover:text-primary">
          {post.title}
        </ItemTitle>

        <ItemDescription className="line-clamp-2">
          {post.summary ? (
            <>
              <RiAiGenerateText className="mr-px inline size-4 text-muted-foreground" />{" "}
              {post.summary}
            </>
          ) : (
            getExcerpt(post)
          )}
        </ItemDescription>

        <p className="text-xs text-muted-foreground">
          {post.authors.map((author) => author.name).join(", ")}
          {" • "}
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-muted px-2 py-0.5 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </ItemContent>

      <ItemActions>
        <RiArrowRightLine className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </ItemActions>
    </Item>
  );
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ItemGroup>
      {posts.map((post) => (
        <PostRenderer key={post._meta.path} post={post} />
      ))}
    </ItemGroup>
  );
}
