import { createFileRoute } from "@tanstack/react-router";
import { eventInfo } from "#/lib/meta/events";
import { ProgramsEventPage } from "./-shared";
import { ExtLink } from "#/components/ui/ethendotapp/link";
import { HackathonFAQ } from "#/components/elements/HackathonFAQ";
import { MakeCarousel } from "#/components/elements/MakeCarousel.tsx";
import { cn } from "#/lib/utils";
import { RiLink } from "@remixicon/react";
import { Separator } from "#/components/ui/separator";

export const Route = createFileRoute("/programs/hackathon")({
  staticData: { title: "Hackathon 6.0" },
  component: () => (
    <ProgramsEventPage
      event={eventInfo.hackathon}
      additions={{
        left: {
          end: (
            <>
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
                  {/*<li>#niche</li>*/}
                </ul>
                <p>
                  Check out our previous workshops:{" "}
                  <ExtLink href="https://github.com/hackgwinnett/workshops">
                    hackgwinnett/workshops
                  </ExtLink>
                  {/* TODO: actually make this archive */}
                </p>
              </div>

              <Separator />

              <div>
                <ExtLink
                  className="text-primary underline not-hover:decoration-primary/50 w-fit"
                  href="https://www.youtube.com/watch?v=aQhZfWQlVXU"
                  buttonStyle
                >
                  <RiLink />
                  Hackathon 5.0 Recap
                </ExtLink>
                <ExtLink
                  className="text-primary underline not-hover:decoration-primary/50 w-fit"
                  href="https://www.instagram.com/reel/DSlEv4xifqL/"
                  buttonStyle
                >
                  <RiLink />
                  Hackathon 5.0 DMC Recap
                </ExtLink>
                <p>
                  As seen in{" "}
                  <ExtLink
                    className="text-primary underline not-hover:decoration-primary/50 w-fit"
                    href="https://hackathons.hackclub.com/"
                  >
                    Hack Club Hackathons
                  </ExtLink>
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
                  src={"/assets/images/events/hackathon/IMG_6720.JPG".toAsset()}
                  alt="1st place prize winners (HG 5.0)"
                />,
                <img
                  src={"/assets/images/events/hackathon/IMG_6700.JPG".toAsset()}
                  alt="Ms. Rachkovskiy at HackGwinnett 5.0. To the right, Jaden side-eyes the camera."
                />,
                // TODO: who is this speaker (for alt text) (+ more images from diff years)
                <img
                  src={"/assets/images/events/hackathon/IMG_6716.JPG".toAsset()}
                  alt="IMG_6716.JPG"
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.02 PM.png".toAsset()}
                  alt="Vishnu and Serge pay attention to a workshop at 5.0."
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.03 PM.png".toAsset()}
                  alt="Neal speaks to the participants at 5.0."
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.05 PM.png".toAsset()}
                  alt="screenshot-2026-07-19-at-25205-pm"
                />,
                <img
                  src={"/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.07 PM.png".toAsset()}
                  alt="screenshot-2026-07-19-at-25207-pm"
                />,
              ]}
            />
          ),
          end: <HackathonFAQ responsiveText={false} />,
        },
      }}
    />
  ),
});
