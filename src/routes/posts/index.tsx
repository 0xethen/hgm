import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination";
import { createFileRoute, Link } from "@tanstack/react-router";
import { posts as everyPost } from "cms/posts/posts";
import { PostList } from "#/components/elements/posts/PostRenderer";
import pluralize from "pluralize";
import { z } from "zod/mini";

export const Route = createFileRoute("/posts/")({
  staticData: { breadcrumb: false },
  validateSearch: z.object({
    page: z.optional(z._default(z.int(), 1)),
  }),
  component: RouteComponent,
});

const POSTS_PER_PAGE = 9;

const posts = everyPost.filter((p) => !p.unlisted); // public posts

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
    <div className="space-y-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-4xl">Posts</h2>
          <p className="text-muted-foreground">
            page {currentPage} of {totalPages} ({posts.length} {pluralize("post", posts.length)})
          </p>
        </div>
        {mostUsedTags.length > 0 && (
          <div className="flex flex-row gap-2">
            {mostUsedTags.map((tag) => (
              <Link
                key={tag}
                to="/posts/tag/$tag"
                params={{ tag }}
                className="bg-muted px-3 py-1 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <section className="space-y-4">
        <PostList posts={currentPosts} />

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
