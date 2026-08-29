export const brand = {
  name: "HackGwinnett",
  domain: "hackgwinnett.org",
  company: "HackGwinnett",
  description:
    "HackGwinnett is Metro Atlanta's premier computer science organization and programming event organizer, dedicated to fostering innovation, collaboration, and technical excellence among Middle/High School students in Gwinnett and beyond.", // `HackGwinnett is a student-run organization that aims to promote computer science and technology education in Gwinnett County, Georgia. We organize hackathons, workshops, and other events to help students learn and grow in the field of technology.`
  handles: {
    // https://instagram.com/
    instagram: "hackgwinnett",
    // https://youtube.com/@
    youtube: "hackgwinnett",
    // NOTE: https://discord.gg/amcVA5Yp5a ---- .gg/hackgwinnett vanity link would be tuff
    discord: "QhsBjMAEJ",
  },
};

/** set by build.ts from the origin remote, so a fork's footer points at the fork */
export const repo = {
  slug: import.meta.env.PUBLIC_GIT_REPO || "hackgwinnett/www",
  get url() {
    return `https://github.com/${repo.slug}`;
  },
  /** the exact commit this build came from, when we know it */
  get commitUrl() {
    const sha = import.meta.env.PUBLIC_GIT_SHA;
    return sha ? `${repo.url}/commit/${sha}` : repo.url;
  },
};

export const socialLinks = {
  instagram: `https://instagram.com/${brand.handles.instagram}`,
  youtube: `https://youtube.com/@${brand.handles.youtube}`,
  discord: `https://discord.gg/${brand.handles.discord}`,
};
