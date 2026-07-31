interface AuthorInfo {
  name: string;
  bio: string;
  avatar: string;
  socials?: { platform: "Instagram" | "Twitter" | "GitHub" | "Email"; url: string }[];
  officer?: boolean;
}

export type Author = AuthorInfo & { id: string }; // id is injected in posts.ts

// todo: replace with array and "id" prop?

export const authorInfo: Record<string, AuthorInfo> = {
  hg: {
    name: "HackGwinnett Team",
    bio: "HackGwinnett is a student-led CS organization based in Gwinnett County, Georgia.",
    avatar: "https://avatars.githubusercontent.com/hackgwinnett",
    socials: [
      { platform: "Instagram", url: "https://instagram.com/hackgwinnett" },
      { platform: "GitHub", url: "https://github.com/hackgwinnett" },
      { platform: "Email", url: "mailto:hello@hackgwinnett.com" },
    ],
    officer: true,
  },
  ethen: {
    name: "Ethen Tseggai",
    bio: "enjoys water and long walks on the beach",
    avatar: "https://avatars.githubusercontent.com/0xethen",
    socials: [
      { platform: "Instagram", url: "https://instagram.com/ethentseggai" },
      { platform: "GitHub", url: "https://github.com/0xethen" },
    ],
    officer: true,
  },
  unknown: {
    name: "Unknown Author",
    bio: "(this author has not been added to the author list yet)",
    avatar: "/assets/avatars/unknown.png",
  },
};

// export const authorInfo: Record<string, AuthorInfo> = Object.fromEntries(
//   Object.entries(authorInfoRaw).map(([id, info]) => [id, { ...info, id }]),
// );
