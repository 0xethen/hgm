import { z } from "zod/mini";
import { events } from "#/lib/meta/events";

export const FORM_URL = events.hackathon.registration?.url ?? "";

export const GRADES = ["6th", "7th", "8th", "9th", "10th", "11th", "12th"] as const;

export const TEAM_CHOICES = {
  solo: "I'm working on my own",
  friends: "I want to choose my teammates",
  placed: "I want to be placed in a group",
} as const;

export type TeamChoice = keyof typeof TEAM_CHOICES;

const TEAM_KEYS = Object.keys(TEAM_CHOICES) as [TeamChoice, ...TeamChoice[]];

// unlocks team.json
export const TEAM_ROSTER_CHOICE: TeamChoice = "friends";

export const MIN_TEAMMATES = 1;
// the form only asks about two teammates, so a team is you plus two
export const MAX_TEAMMATES = 2;

const ENTRY = {
  name: "entry.1150302860",
  preferredName: "entry.1374666144",
  school: "entry.521603961",
  schoolEmail: "entry.1068002100",
  grade: "entry.1541810057",
  team: "entry.138698166",

  teamName: "entry.832063502",
  // the form asks about two teammates; the third pair of ids it once had is gone
  teammates: [
    { name: "entry.859848346", school: "entry.2123245281" },
    { name: "entry.1965091872", school: "entry.1430270724" },
  ],
} as const;

const shortText = (label: string, max = 120) =>
  z
    .string(`${label} is required`)
    .check(
      z.minLength(2, `${label} needs at least two characters`),
      z.maxLength(max, `${label} is too long`),
    );

const optionalText = (label: string, max = 120) =>
  z.optional(z.string(`${label} must be text`).check(z.maxLength(max, `${label} is too long`)));

export const aboutSchema = z.strictObject({
  name: shortText("name"),
  preferredName: optionalText("preferredName", 60),
  school: shortText("school"),
  schoolEmail: z.email("schoolEmail must look like your@school.org"),
  grade: z.enum(GRADES, `grade must be one of ${GRADES.map((g) => `"${g}"`).join(", ")}`),
  team: z.enum(TEAM_KEYS, `team must be one of ${TEAM_KEYS.map((t) => `"${t}"`).join(", ")}`),
});

export type About = z.infer<typeof aboutSchema>;

const teammateSchema = z.strictObject({
  name: z.string("name is required"),
  school: z.string("school is required"),
});

// removed in prefill
export function isEmptyTeammate(teammate: { name: string; school: string }): boolean {
  return !teammate.name.trim() && !teammate.school.trim();
}

export const teamSchema = z
  .strictObject({
    team: shortText("team", 60),
    teammates: z
      .array(teammateSchema)
      .check(z.maxLength(MAX_TEAMMATES, `a team is you plus at most ${MAX_TEAMMATES} others`)),
  })
  .check((ctx) => {
    const roster = ctx.value.teammates ?? [];

    const complain = (slot: number, key: "name" | "school", message: string) =>
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        path: ["teammates", slot, key],
        message,
      });

    roster.forEach((teammate, slot) => {
      if (isEmptyTeammate(teammate)) return;
      if (teammate.name.trim().length < 2)
        complain(slot, "name", "name needs at least two characters");
      if (teammate.school.trim().length < 2)
        complain(slot, "school", "school needs at least two characters");
    });

    if (roster.every(isEmptyTeammate)) {
      complain(0, "name", `name at least one teammate`);
    }
  });

export type Team = z.infer<typeof teamSchema>;

export interface FieldDoc {
  key: string;
  type: string;
  required: boolean;
  hint: string;
  /** the values worth completing, when the field is a closed set */
  values?: readonly string[];
  /** for an array of objects, the fields each entry has */
  children?: FieldDoc[];
}

const ABOUT_FIELDS: FieldDoc[] = [
  { key: "name", type: "string", required: true, hint: "your first and last name" },
  { key: "preferredName", type: "string", required: false, hint: "what we should call you" },
  { key: "school", type: "string", required: true, hint: "the school you attend" },
  {
    key: "schoolEmail",
    type: "string",
    required: true,
    hint: "your school email (like @g.gcpsk12.org)",
  },
  { key: "grade", type: "enum", required: true, hint: "your grade this year", values: GRADES },
  {
    key: "team",
    type: "enum",
    required: true,
    hint: "who you will work with on-site",
    values: TEAM_KEYS,
  },
];

const TEAM_FIELDS: FieldDoc[] = [
  { key: "name", type: "string", required: true, hint: "what your team is called" },
  {
    key: "teammates",
    type: "object[]",
    required: true,
    hint: `up to ${MAX_TEAMMATES} people (besides you)`,
    children: [
      { key: "name", type: "string", required: true, hint: "their first and last name" },
      { key: "school", type: "string", required: true, hint: "the school they attend" },
    ],
  },
];

export interface RegistrationDocument {
  id: "about" | "team";
  /** the filename shown on the editor tab and in every diagnostic */
  name: string;
  fields: FieldDoc[];
  boilerplate: string;
}

export const ABOUT_DOCUMENT: RegistrationDocument = {
  id: "about",
  name: "me.json",
  fields: ABOUT_FIELDS,
  boilerplate: [
    "// tell us more about yourself!",
    "// hit return (enter) to move on to the next field!",
    "",
    "{",
    '  "name": "",',
    // '  "school": "",',
    "}",
  ].join("\n"),
};

export const TEAM_DOCUMENT: RegistrationDocument = {
  id: "team",
  name: "team.json",
  fields: TEAM_FIELDS,
  boilerplate: [
    `// who you're bringing. teams include you plus up to ${MAX_TEAMMATES} others.`,
    `// make sure teammates complete out their own registration!`,
    "{",
    '  "team": "",',
    '  "teammates": [',
    ...Array.from({ length: MAX_TEAMMATES }, (_, slot) => [
      `    // Teammate #${slot + 1}${slot > MIN_TEAMMATES - 1 ? " (optional)" : ""}`,
      // no blank line between slots, so Review's reformat leaves the boilerplate as it found it
      `    { "name": "", "school": "" }${slot < MAX_TEAMMATES - 1 ? "," : ""}`,
    ]).flat(),
    "  ]",
    "}",
  ].join("\n"),
};

export function wantsRoster(about: Partial<About> | undefined): boolean {
  return about?.team === TEAM_ROSTER_CHOICE;
}

function put(params: URLSearchParams, entry: string, value: string | undefined) {
  const trimmed = value?.trim();
  if (trimmed) params.set(entry, trimmed);
}

export function buildPrefillUrl(about: About, team?: Team): string {
  const params = new URLSearchParams({ usp: "pp_url" });

  put(params, ENTRY.name, about.name);
  put(params, ENTRY.preferredName, about.preferredName);
  put(params, ENTRY.school, about.school);
  put(params, ENTRY.schoolEmail, about.schoolEmail);
  put(params, ENTRY.grade, about.grade);
  put(params, ENTRY.team, TEAM_CHOICES[about.team]);

  if (team) {
    put(params, ENTRY.teamName, team.team);

    // blank slots are how a two-person team is written, so they never reach the form
    team.teammates
      .filter((teammate) => !isEmptyTeammate(teammate))
      .slice(0, MAX_TEAMMATES)
      .forEach((teammate, slot) => {
        put(params, ENTRY.teammates[slot].name, teammate.name);
        put(params, ENTRY.teammates[slot].school, teammate.school);
      });
  }

  return `${FORM_URL}?${params.toString()}`;
}
