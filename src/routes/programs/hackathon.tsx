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
  staticData: { title: "Hackathon" },
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
                  computer science skill or domain. Workshops run simultaneously, so you can only
                  choose one per time slot (round). You may attend up to 4 workshops total, but you
                  don't have to attend one for each time slot. Usually, after lecture, you'll have
                  time to work on your project submission (you may even apply the skills you learned
                  to improve it!).
                </p>
                <p>This year, workshops include:</p>
                <ul className="list-disc list-inside">
                  <li>Now this is a story all about how</li>
                  <li>my life got flipped-turned upside down</li>
                  <li>#niche</li>
                </ul>
              </div>

              <Separator />

              <div>
                <ExtLink
                  className="text-primary underline w-fit"
                  href="https://www.youtube.com/watch?v=aQhZfWQlVXU"
                  buttonStyle
                >
                  <RiLink />
                  Hackathon 5.0 Recap
                </ExtLink>
                <ExtLink
                  className="text-primary underline w-fit"
                  href="https://www.instagram.com/reel/DSlEv4xifqL/"
                  buttonStyle
                >
                  <RiLink />
                  Hackathon 5.0 DMC Recap
                </ExtLink>
                <p>
                  As seen in{" "}
                  <ExtLink
                    className="text-primary underline w-fit"
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
                  src="/assets/images/events/hackathon/IMG_6720.JPG"
                  alt="1st place prize winners (HG 5.0)"
                />,
                <img
                  src="/assets/images/events/hackathon/IMG_6700.JPG"
                  alt="Ms. Rachkovskiy at HackGwinnett 5.0. To the right, Jaden side-eyes the camera."
                />,
                // TODO: who is this speaker (for alt text) (+ more images from diff years)
                <img src="/assets/images/events/hackathon/IMG_6716.JPG" alt="IMG_6716.JPG" />,
                <img
                  src="/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.02 PM.png"
                  alt="Vishnu and Serge pay attention to a workshop at 5.0."
                />,
                <img
                  src="/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.03 PM.png"
                  alt="Neal speaks to the participants at 5.0."
                />,
                <img
                  src="/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.05 PM.png"
                  alt="screenshot-2026-07-19-at-25205-pm"
                />,
                <img
                  src="/assets/images/events/hackathon/oldss/Screenshot 2026-07-19 at 2.52.07 PM.png"
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
