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

export const socialLinks = {
  instagram: `https://instagram.com/${brand.handles.instagram}`,
  youtube: `https://youtube.com/@${brand.handles.youtube}`,
  discord: `https://discord.gg/${brand.handles.discord}`,
};
