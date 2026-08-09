// TODO: is there a required UTM link for any sponsorships?

export type Sponsor = {
  title: string;
  href: string;
  src: string;
};

const sponsorList: { main: Array<Sponsor>; other: Array<Sponsor> } = {
  // main / premier sponsors
  main: [{ title: "State Farm", href: "https://st8.fm/hg", src: "statefarm-v2.svg" }],

  // other sponsors (scroller / grid):
  other: [
    { title: "Replit", href: "https://repl.it/hg", src: "replit.svg" },
    { title: "Inspirit AI", href: "https://inspiritai.com/hg", src: "inspirit.jpeg" },
    { title: "Taskade", href: "https://taskade.com/hg", src: "taskade-v2.svg" },
    { title: "egghead.io", href: "https://egghead.io/hg", src: "egghead.svg" },
    { title: "Hack Club", href: "https://hackclub.com/hg", src: "hackclub.svg" },
    { title: "Interview Cake", href: "https://interviewcake.com/hg", src: "intcake.svg" },
    { title: "MIE Coach", href: "https://miecoach.com/hg", src: "mie-logo.png" },
    { title: "GSMST", href: "https://gsmst.org/", src: "gsmst.webp" },
  ],
};

const makeSponsor = (s: Sponsor): Sponsor => ({
  ...s,
  src: `/assets/images/sponsors/${s.src}`.toAsset(),
});

export const mainSponsors: Array<Sponsor> = sponsorList.main.map(makeSponsor);
export const otherSponsors: Array<Sponsor> = sponsorList.other.map(makeSponsor);

export const sponsors: Array<Sponsor> = [...mainSponsors, ...otherSponsors];
