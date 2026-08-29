import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ScrollArea } from "#/components/ui/scroll-area";
import { createFileRoute, Link } from "@tanstack/react-router";
import { posts } from "cms/posts/posts";
import { Fallback } from "#/components/Fallback";

export const Route = createFileRoute("/posts/tag/$tag")({
  staticData: {
    breadcrumb: {
      label: (match) => `#${match.params.tag}`,
    },
    classNames: { container: "max-w-4xl" },
  },
  loader: async ({ params }) => {
    const found = posts.filter((post) => post.tags?.some((a) => a === params.tag));
    return { posts: found, tag: params.tag };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { posts, tag } = Route.useLoaderData();

  if (!posts || posts.length === 0)
    return (
      <Fallback
        // sits inside the page container, so it doesn't get to claim the whole viewport
        className="min-h-[50svh]"
        title={`404: nothing is tagged #${tag}`}
        actions={[{ label: "all posts", to: "/posts" }]}
      />
    );

  return (
    <div>
      <div className="space-y-4">
        <h3>
          <span className="font-normal">Posts tagged</span> #{tag}
        </h3>
      </div>
      <ScrollArea className="h-[60vh]">
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post._meta.path}>
              <CardHeader>
                <CardTitle>
                  <a href={`/posts/${post._meta.path}`} className="block">
                    {post.title}
                  </a>
                </CardTitle>
                <CardDescription className="text-sm">{/* {post.excerpt ?? ""} */}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {/* {post.readingTime ? `${post.readingTime} min read · ` : ""}
                {post.date ? format(new Date(post.date), "MMM d, yyyy") : ""} */}
                </div>
                <div>
                  <Link
                    to="/posts/$postId"
                    params={{ postId: post._meta.path.slugify() }}
                    className="link"
                  >
                    Read
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
