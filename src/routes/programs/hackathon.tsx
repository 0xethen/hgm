import { createFileRoute, Link } from "@tanstack/react-router";
import { eventInfo } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-shared";
import { HackathonFAQ } from "#/components/elements/HackathonFAQ";
import { MakeCarousel } from "#/components/elements/MakeCarousel.tsx";
import { cn } from "#/lib/utils";
import { RiLink } from "@remixicon/react";
import { Separator } from "#/components/ui/separator";
import { pages } from "cms/pages/pages";
import { md } from "#/lib/markdown";
import { eventSchema } from "#/lib/seo";

const eventId = "hackathon";

export const Route = createFileRoute("/programs/hackathon")({
  staticData: { title: eventInfo[eventId].name },
  loader: async () => {
    const content = pages.find((p) => eventId === p._meta.path.slugify());
    return content || { content: "" };
  },
  head: () => ({
    meta: [
      eventSchema({
        name: eventInfo[eventId].name,
        description: eventInfo[eventId].description,
        startDate: eventInfo[eventId].startDate,
        endDate: eventInfo[eventId].endDate,
        url: "https://hackgwinnett.org/programs/hackathon",
        location: eventInfo[eventId].location,
        price: eventInfo[eventId].price || 0,
      }),
    ],
  }),
  component: RouteComponent,
});

/*
<div className="space-y-2" id="workshops">
  <p>
    <span className="font-medium">Workshops:</span> Workshops are 40-minute sessions
    during the hackathon that allow participants to gain hands-on experience in a new
    computer science skill or domain. Workshops run{" "}
    <span className="italic">simultaneously</span>, so you can only choose one per
    time slot (round).
  </p>
  <p>
    This year, you may attend up to 4 workshops total. Like always, you don't have to
    attend one for each time slot--and usually, after lecture, you'll have time to
    work on your hackathon submission. You may even apply the skills you learned to
    improve your project!
  </p>
  <ul className="list-disc list-inside [&>li]:ml-4">
    <p>
      Here's what you can choose from when you{" "}
      <ExtLink href="/go/register">sign up</ExtLink> for Hackathon 6.0:
    </p>
    <p className="font-medium mt-2">Beginner</p>
    <li>Essential Sorting and Searching Algorithms</li>
    <li>Intro to Cybersecurity</li>
    <li>Github and Git</li>
    <p className="font-medium mt-2">Advanced</p>
    <li>Fight Wildfires with AI</li>
    <li>Serverless Computing</li>
    <li>Fullstack Applications (in 2026)</li>
  </ul>
  <p>
    Check out our previous workshops:{" "}
    <ExtLink href="https://github.com/hackgwinnett/workshops">
      hackgwinnett/workshops
    </ExtLink>
  </p>
</div>
*/

function RouteComponent() {
  const document = Route.useLoaderData();
  const content = (
    <div
      className="typeset max-w-none space-y-2"
      dangerouslySetInnerHTML={{ __html: md(document.content) }}
    />
  );

  return (
    <ProgramsEventPage
      event={eventInfo[eventId]}
      content={content || eventInfo[eventId].description}
      additions={{
        left: {
          // /programs/hackathon#workshops brings you to this description
          start: <div id="workshops" />,
          end: (
            <>
              <Separator />

              <div>
                <Link
                  className="link icon-link text-primary underline not-hover:decoration-primary/50 w-fit"
                  to={"https://www.youtube.com/watch?v=aQhZfWQlVXU" as string}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RiLink />
                  Hackathon 5.0 Recap
                </Link>
                <Link
                  className="link icon-link text-primary underline not-hover:decoration-primary/50 w-fit"
                  to={"https://www.instagram.com/reel/DSlEv4xifqL/" as string}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RiLink />
                  Hackathon 5.0 DMC Recap
                </Link>
                <p>
                  As seen in{" "}
                  <Link
                    className="link text-primary underline not-hover:decoration-primary/50 w-fit"
                    to={"https://hackathons.hackclub.com/" as string}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hack Club Hackathons
                  </Link>
                </p>
                {/* TODO: put more social media/in the news/etc */}
              </div>
              {/*<p>
                Check out more of 6.0 in our{" "}
                <Link to="/posts/tag/$tag" params={{ tag: "hg6" }}>
                  #hg6
                </Link>{" "}
                posts!
              </p>*/}
            </>
          ),
        },
        right: {
          start: (
            <MakeCarousel
              className={cn(
                "max-w-full md:max-w-xl lg:max-w-full h-80 overflow-hidden",
                "[&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-center [&>img]:drag-none",
              )}
              items={[
                <img
                  src={"/assets/images/events/hackathon/IMG_6720-resize.jpg".toAsset()}
                  alt="1st place prize winners (HG 5.0)"
                />,
                <img
                  src={"/assets/images/events/hackathon/IMG_6700-resize.jpg".toAsset()}
                  alt="Ms. Rachkovskiy at HackGwinnett 5.0. To the right, Jaden side-eyes the camera."
                />,
                // TODO: who is this speaker (for alt text) (+ more images from diff years)
                <img
                  src={"/assets/images/events/hackathon/IMG_6716-resize.jpg".toAsset()}
                  alt="IMG_6716.JPG"
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/ss-02-resize.jpg".toAsset()}
                  alt="Vishnu and Serge pay attention to a workshop at 5.0."
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/ss-03-resize.jpg".toAsset()}
                  alt="Neal speaks to the participants at 5.0."
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/ss-05-resize.jpg".toAsset()}
                  alt="screenshot-2026-07-19-at-25205-pm"
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/ss-07-resize.jpg".toAsset()}
                  alt="screenshot-2026-07-19-at-25207-pm"
                />,
              ]}
            />
          ),
          end: <HackathonFAQ responsiveText={false} />,
        },
      }}
    />
  );
}
