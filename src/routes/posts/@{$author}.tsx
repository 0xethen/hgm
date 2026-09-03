import { NotFound } from "#/components/NotFound";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { ColorBadge } from "#/components/ui/color-badge";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Separator } from "#/components/ui/separator";
import { cap } from "#/lib/utils";
import { RiAtLine, RiGithubFill, RiInstagramLine, RiTwitterLine } from "@remixicon/react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { posts } from "cms/posts/posts";
import { authorInfo } from "cms/posts/authors";
import { useBreakpoint } from "#/hooks/browser";
import { PostList } from "#/components/elements/posts/Cards";
import pluralize from "pluralize";

export const Route = createFileRoute("/posts/@{$author}")({
  staticData: {
    classNames: { container: "max-w-4xl" },
    title: (match) => `${match.loaderData?.author?.name || "Unknown"}'s posts`,
  },
  loader: async ({ params }) => {
    const found = posts.filter((post) => post.authors.some((a) => a.id === params.author));
    if (!found || found.length === 0) throw notFound();

    const authorId = params.author;
    if (!authorInfo[authorId] || authorId === "unknown") throw notFound();

    return { posts: found, author: authorInfo[authorId] };
  },
  component: RouteComponent,
  notFoundComponent: (props) => (
    <NotFound
      {...props}
      title="404: author not found"
      link={{ text: "all posts", href: "/posts" }}
    />
  ),
});

function RouteComponent() {
  const { posts, author } = Route.useLoaderData();

  const { md } = useBreakpoint();
  const isMobile = !md;

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar size={isMobile ? "lg" : "2xl"}>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.initials()}</AvatarFallback>
            <AvatarBadge
              className="bg-secondary text-secondary-foreground text-xs"
              title={`Authored ${posts.length} ${pluralize("post", posts.length)}`}
            >
              {cap(posts.length, 99, "+")}
            </AvatarBadge>
          </Avatar>
          <div>
            <h1 className="inline-flex items-center gap-2 text-lg md:text-3xl font-semibold">
              {author.name} {author.officer && <ColorBadge>Team</ColorBadge>}
            </h1>
            <p className="text-sm md:text-base text-gray-600">{author.bio}</p>
          </div>
        </div>

        {author.socials && (
          <div className="grid grid-cols-2 md:grid-flow-col gap-2">
            {author.socials?.map((social) => (
              <Button
                key={social.platform}
                size={!isMobile ? "icon" : "sm"}
                variant="secondary"
                render={<Link to={social.url} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                {social.platform === "Instagram" && <RiInstagramLine />}
                {social.platform === "Twitter" && <RiTwitterLine />}
                {social.platform === "GitHub" && <RiGithubFill />}
                {social.platform === "Email" && <RiAtLine />} {isMobile && social.platform}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <ScrollArea className="h-[60vh]">
        <PostList posts={posts} />
      </ScrollArea>
    </div>
  );
}
