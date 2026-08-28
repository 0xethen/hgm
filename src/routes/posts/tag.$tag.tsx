import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Separator } from "#/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { posts } from "cms/posts/posts";

export const Route = createFileRoute("/posts/tag/$tag")({
  staticData: { breadcrumb: { label: (match) => `#${match.params.tag}` } },
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
      <div className="min-h-safe-dvh flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <h3>404</h3>
          <Separator orientation="vertical" />
          <p>There are no posts with #{tag} :(</p>
        </div>
        <Link to="/posts" className="link">
          All posts
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
