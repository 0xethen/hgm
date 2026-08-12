export interface HGEvent {
  /** The name of the event */
  name: string;
  /** The shortened name of the event */
  shortName?: string;
  /** A short summary of the event */
  description: string;
  /** The `cms/pages/content` pathname for the .md file about this event */
  content?: string;
  // details?: string; // removed in place of content
  /** The location details for the event */
  location: {
    /** The location name (Gwinnett School of Math, Science, and Tech) */
    name: string;
    /** A short location name (GSMST) */
    shortName?: string;
    /** The physical address or virtual conference software required to join */
    address: string;
    /** The Apple Maps address link or virtual meeting link */
    mapUrl: string;
  };
  /** The start date & time of the event */
  startDate: Date;
  /** The end date & time of the event */
  endDate: Date;
  /** The registration details of the event, if any */
  registration?: {
    /** Whether registration has closed for this event
     * if the event is far into the future, set to false
     * if the event date is close but registration deadline has passed, set to true
     * otherwise, set to false (or nothing)
     */
    closed?: boolean;
    /** The registration link. Could be a Google Form, email compose link, etc. */
    url: string;
  };
}

// todo: better descriptions?
export const eventInfo: Record<string, HGEvent> = {
  hackathon: {
    name: "Hackathon 6.0",
    shortName: "HG6",
    description: "A free, one-day hackathon for middle and high school students.",
    // details:
    //   "Hackathon 6.0 is a one-day hackathon for middle and high school students. Students will work in teams to create projects and compete for prizes. Workshops for total beginners or seasoned pros are available throughout the day (because we can all learn something new!). Sign up NOW!",
    location: {
      name: "Gwinnett School of Mathematics, Science, and Technology",
      shortName: "GSMST",
      address: "970 McElvaney Ln, Lawrenceville, GA 30044",
      mapUrl: "https://maps.apple.com/place?place-id=I3551F8AF8A34BB8A", // https://goo.gl/maps/1Zt7n9s5mL2qjv3bA
    },
    startDate: new Date("2026-10-24T09:00:00"),
    endDate: new Date("2026-10-24T17:00:00"),
    registration: {
      url: "/go/register",
      closed: true,
    },
  },
  hackfest: {
    name: "HackFest IV",
    shortName: "HF4",
    description: "A one-day STEM event for primary students.",
    content: "hackfest",
    // details:
    //   "HackFest IV is a one-day STEM event for primary students. Students will learn about technology and coding through hands-on activities and workshops.",
    location: {
      name: "Baggett Elementary School",
      address: "2136 Old Norcross Rd, Lawrenceville, GA 30044",
      mapUrl: "https://maps.apple.com/place?place-id=I992A6F0C1A2001BD", // https://goo.gl/maps/1Zt7n9s5mL2qjv3bA
    },
    startDate: new Date("2026-03-24T09:00:00"),
    endDate: new Date("2026-03-24T17:00:00"),
  },
};
