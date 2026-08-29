// TODO: officers add UTM tracking to all sponsors that require it
export type Sponsor = {
  title: string;
  href: string;
  src: string;
  /** set false for vanity/short links, which already carry their own tracking! */
  utm?: boolean;
};

const UTM = {
  utm_source: "hackgwinnett",
  utm_medium: "referral",
  utm_campaign: "sponsors",
};

const sponsorList: { main: Array<Sponsor>; other: Array<Sponsor> } = {
  // main / premier sponsors
  main: [{ title: "State Farm", href: "https://st8.fm/hg", src: "statefarm-v2.svg", utm: false }],

  // other sponsors (scroller / grid):
  other: [
    { title: "Replit", href: "https://replit.com", src: "replit.svg" },
    { title: "Inspirit AI", href: "https://inspiritai.com", src: "inspirit.jpeg" },
    { title: "Taskade", href: "https://taskade.com", src: "taskade-v2.svg" },
    { title: "egghead.io", href: "https://egghead.io", src: "egghead.svg" },
    { title: "Hack Club", href: "https://hackclub.com", src: "hackclub.svg" },
    { title: "Interview Cake", href: "https://www.interviewcake.com", src: "intcake.svg" },
    { title: "MIE Coach", href: "https://miecoach.com", src: "mie-logo.png" },
    { title: "GSMST", href: "https://www.gsmst.org", src: "gsmst.webp", utm: false },
  ],
};

function withUtm(href: string): string {
  try {
    const url = new URL(href);
    for (const [key, value] of Object.entries(UTM)) url.searchParams.set(key, value);
    return url.toString();
  } catch {
    return href;
  }
}

const sponsorify = (s: Sponsor): Sponsor => ({
  ...s,
  href: s.utm === false ? s.href : withUtm(s.href),
  src: `/assets/images/sponsors/${s.src}`.toAsset(),
});

export const mainSponsors: Array<Sponsor> = sponsorList.main.map(sponsorify);
export const otherSponsors: Array<Sponsor> = sponsorList.other.map(sponsorify);

export const sponsors: Array<Sponsor> = [...mainSponsors, ...otherSponsors];
