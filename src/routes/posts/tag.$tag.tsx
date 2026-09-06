import { createFileRoute } from "@tanstack/react-router";
import { posts } from "cms/posts";
import { Fallback } from "#/components/Fallback";
import { PostList } from "#/components/elements/posts/Cards";

export const Route = createFileRoute("/posts/tag/$tag")({
  staticData: {
    classNames: { container: "max-w-4xl" },
    breadcrumb: {
      label: (match) => `#${match.params.tag}`,
    },
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
        className="min-h-[50svh]"
        title={`404: nothing is tagged #${tag}`}
        actions={[{ label: "all posts", to: "/posts" }]}
      />
    );

  return (
    <div className="space-y-6">
      <h3>
        <span className="font-normal">Posts tagged</span> #{tag}
      </h3>

      <PostList posts={posts} />
    </div>
  );
}
