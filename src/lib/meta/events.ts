export interface HGEvent {
  name: string;
  shortName?: string;
  description: string;
  details?: string;
  location: {
    name: string;
    shortName?: string;
    address: string;
    mapUrl: string;
  };
  startDate: Date;
  endDate: Date;
  registration?: {
    // if the event is far into the future, do not include registration
    // if the event date is close but registration deadline has passed, set closed to true
    // otherwise, set closed to false
    closed?: boolean;
    url: string;
  };
}

// todo: better descriptions?
export const eventInfo: Record<string, HGEvent> = {
  hackathon: {
    name: "HackGwinnett 6.0",
    shortName: "HG6",
    description: "A one-day hackathon for middle and high school students.",
    details:
      "HackGwinnett 6.0 is a one-day hackathon for middle and high school students. Students will work in teams to create projects and compete for prizes. Workshops for total beginners or seasoned pros are available throughout the day (because we can all learn something new!). Sign up NOW!",
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
    details:
      "HackFest IV is a one-day STEM event for primary students. Students will learn about technology and coding through hands-on activities and workshops.",
    location: {
      name: "Baggett Elementary School",
      address: "2136 Old Norcross Rd, Lawrenceville, GA 30044",
      mapUrl: "https://maps.apple.com/place?place-id=I992A6F0C1A2001BD", // https://goo.gl/maps/1Zt7n9s5mL2qjv3bA
    },
    startDate: new Date("2026-03-24T09:00:00"),
    endDate: new Date("2026-03-24T17:00:00"),
  },
};
