import { HackathonFAQ } from "#/components/elements/HackathonFAQ";
import { NewsletterCTA } from "#/components/elements/NewsletterCTA";
import { SponsorSection } from "./sponsors.tsx";

export function HomepageMainContent() {
  return (
    <div className="bg-background p-6 sm:p-8 md:p-12 space-y-12">
      {/* Section 1 */}
      <section id="hg-info" className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-4 text-base md:text-lg lg:text-xl leading-relaxed">
          <h1 className="text-2xl sm:text-3xl md:text-4xl">Hack-a-What?!</h1>
          <p>
            HackGwinnett is Metro Atlanta's premier high school computer science organization.
            HackGwinnett's signature event is its annual hackathon: free of cost, hosted at Gwinnett
            School of Mathematics, Science, and Technology, and open to middle and high school
            students across Georgia.
          </p>
          <p>
            During our flagship hackathon, students (solo or in groups up to four) gather to create
            innovative solutions to real-world problems within a short time constraint. Be on the
            lookout for HackGwinnett's fifth hackathon on October 25th to build awesome projects,
            participate in enriching workshops, and make new friends!
          </p>
        </div>
        <div className="space-y-4 flex flex-col lg:items-end">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl lg:text-end">
            Frequently Asked <span className="inline lg:hidden">Questions</span>
          </h1>
          <HackathonFAQ className="w-full lg:max-w-lg xl:max-w-xl" />
        </div>
      </section>

      {/* Section 2 */}
      <section id="sponsors">
        <SponsorSection />
      </section>

      {/* Section 3 */}
      <section id="newslettercta" className="p-6 bg-accent">
        <NewsletterCTA button="Sign me up, chief!" />
      </section>
    </div>
  );
}
