import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination";
import { RiAiGenerateText } from "@remixicon/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { posts as everyPost } from "cms/posts/posts";
import { z } from "zod/mini";

export const Route = createFileRoute("/posts/")({
  staticData: { title: "All Posts" },
  validateSearch: z.object({
    page: z.optional(z._default(z.int(), 1)),
  }),
  component: RouteComponent,
});

const POSTS_PER_PAGE = 9;
const excerptLength = 180; // line-clamp-3 overrides it to three lines max (visually) in the CSS

const posts = everyPost.filter((p) => !p.unlisted); // public posts

function getExcerpt(post: (typeof posts)[number]) {
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
      .slice(0, excerptLength)
      .trimEnd() + "..."
  );
}

function getVisiblePages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

function getMostUsedTags(maxTags: number = 5) {
  const tagCounts: Record<string, number> = {};

  for (const post of posts) {
    if (!post.tags) continue;
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, maxTags);
}

function RouteComponent() {
  const { page: pageNum } = Route.useSearch();
  const page = pageNum || 1;

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const currentPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const mostUsedTags = getMostUsedTags(7);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-4xl">Posts</h1>
          <p className="text-muted-foreground">
            page {currentPage} of {totalPages} ({posts.length} {"post".plural(posts.length)})
          </p>
        </div>
        {mostUsedTags.length > 0 && (
          <div className="flex flex-row gap-2">
            {mostUsedTags.map((tag) => (
              <Link
                key={tag}
                to="/posts/tag/$tag"
                params={{ tag }}
                className="bg-muted px-3 py-1 text-sm font-medium rounded hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <section className="space-y-4">
        <div className="grid-lanes gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {currentPosts.map((post) => (
            <Link
              key={post._meta.path}
              to="/posts/$postId"
              params={{ postId: post._meta.path }}
              className="group"
            >
              <article className="overflow-hidden border bg-card transition-all hover:shadow-sm flex flex-col">
                {post.cover && (
                  <div className="overflow-hidden bg-muted aspect-video">
                    <img
                      src={post.cover.src || "/assets/posts/covers/default.png".toAsset()}
                      alt={post.cover.alt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex flex-col p-5">
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="bg-muted px-2 py-1 text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.authors.map((a) => a.name).join(", ")}
                    {" • "}
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  {post.summary ? (
                    <p className="mt-4 text-sm">
                      <RiAiGenerateText className="inline text-muted-foreground size-4 mr-px" />{" "}
                      {post.summary}
                    </p>
                  ) : (
                    <p className="mt-3 line-clamp-3 text-sm">{getExcerpt(post)}</p>
                  )}

                  <div className="mt-auto pt-6 text-sm font-medium text-primary">
                    Read article →
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Link to="/posts" search={{ page: Math.max(1, currentPage - 1) }} className="link">
                  <PaginationPrevious
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </Link>
              </PaginationItem>

              {visiblePages.map((item, i) =>
                item === "ellipsis" ? (
                  <PaginationItem key={i}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <Link to="/posts" search={{ page: item }} className="link">
                      <PaginationLink isActive={item === currentPage}>{item}</PaginationLink>
                    </Link>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <Link
                  to="/posts"
                  search={{ page: Math.min(totalPages, currentPage + 1) }}
                  className="link"
                >
                  <PaginationNext
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </Link>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  );
}
