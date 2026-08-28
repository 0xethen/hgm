import React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { posts } from "cms/posts/posts";
import { md } from "#/lib/markdown";
import { NotFound } from "#/components/NotFound";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import { Button } from "#/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "#/components/ui/avatar";
import { RiArrowRightLine } from "@remixicon/react";
import type { Author } from "cms/posts/authors";
import { getTitle } from "#/lib/routing.ts";
import { articleSchema } from "#/lib/seo";

export const Route = createFileRoute("/posts/$postId")({
  staticData: {
    breadcrumb: {
      label: (match) =>
        posts.find((post) => post._meta.path.slugify() === match.params.postId)?.title,
    },
  },
  loader: async ({ params }) => {
    const post = posts.find((p) => params.postId === p._meta.path.slugify());

    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, matches }) => ({
    meta: [
      {
        title: getTitle(matches, " / ", loaderData?.post.title || "Post"),
      },
      ...(loaderData?.post
        ? [
            articleSchema({
              headline: loaderData.post.title,
              description: loaderData.post.summary,
              authorNames: loaderData.post.authors.map((author) => author.name),
              datePublished: loaderData.post.date,
              image: loaderData.post.cover?.src,
              url: `https://hackgwinnett.org/posts/${loaderData.post._meta.path.slugify()}`,
            }),
          ]
        : []),
    ],
  }),
  component: RouteComponent,
  notFoundComponent: (props) =>
    NotFound({
      ...props,
      title: "404: post not found",
      link: { text: "all posts", href: "/posts" },
    }),
});

function RouteComponent() {
  const { post } = Route.useLoaderData();

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-4">
        <Link to="/posts" className="link alt-link">
          All posts
        </Link>
        {post.cover ? (
          <div
            className="flex items-center w-full rounded-lg overflow-hidden mt-4"
            style={{ maxHeight: `calc(var(--spacing) * ${post.cover.height || 46})` }}
          >
            <img src={post.cover.src} alt={post.cover.alt} />
          </div>
        ) : (
          <div />
        )}
        <h2 className="font-medium text-shadow-sm text-shadow-hg-black/15">{post.title}</h2>
        <p className="text-xl text-muted-foreground">{post.summary}</p>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger>
              <div className="flex items-center gap-2 cursor-pointer">
                <AvatarGroup>
                  {post.authors.slice(0, 4).map((author) => (
                    <Avatar key={author.id} size="sm">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{author.name.initials()}</AvatarFallback>
                    </Avatar>
                  ))}

                  {post.authors.length > 4 && (
                    <AvatarGroupCount>+{post.authors.length - 4}</AvatarGroupCount>
                  )}
                </AvatarGroup>
                <AuthorList authors={post.authors} />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Authored by</DialogTitle>
              </DialogHeader>
              <AuthorList authors={post.authors} asItems />
            </DialogContent>
          </Dialog>

          <p className="text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>

          {/* TODO: view counter */}
        </div>
        {post.tags && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge render={<Link to="/posts/tag/$tag" params={{ tag }} />} key={tag}>
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <div className="typeset max-w-none" dangerouslySetInnerHTML={{ __html: md(post.content) }} />
    </article>
  );
}

function AuthorList({ authors, asItems }: { authors: Array<Author>; asItems?: boolean }) {
  if (asItems) {
    return (
      <ItemGroup>
        {authors.map((author) => (
          <Item size="sm" key={author.id} variant="outline">
            <ItemMedia>
              <Avatar className="size-10">
                <AvatarImage src={author.avatar} />
                <AvatarFallback>{author.name.initials()}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{author.name}</ItemTitle>
              <ItemDescription className="text-xs">{author.bio}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="View author details"
                render={
                  <Link to="/posts/@{$author}" params={{ author: author.id }} className="link" />
                }
                nativeButton={false}
              >
                <RiArrowRightLine />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    );
  }

  if (authors.length <= 2) {
    return (
      <p>
        {authors.map((author, i) => (
          <React.Fragment key={author.id}>
            {i > 0 && <span className="text-muted-foreground"> and </span>}
            <Link to="/posts/@{$author}" params={{ author: author.id }} disabled>
              {author.name}
            </Link>
          </React.Fragment>
        ))}
      </p>
    );
  }

  const [first, ...others] = authors;

  return (
    <p>
      {first.name}{" "}
      <span className="text-muted-foreground">
        and {others.length} {"other".plural(others.length)}
      </span>
    </p>
  );
}
