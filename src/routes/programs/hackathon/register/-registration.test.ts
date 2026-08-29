import { expect, test } from "vite-plus/test";
import { completionsAt } from "./-completions.ts";
import { diagnose, parseLoose, selectionOf } from "./-diagnostics.ts";
import {
  format,
  locate,
  matchingBrackets,
  newlineEdit,
  outdentEdit,
  toStrictJson,
  tokenize,
} from "./-jsonc.ts";
import {
  ABOUT_DOCUMENT,
  aboutSchema,
  buildPrefillUrl,
  MAX_TEAMMATES,
  TEAM_DOCUMENT,
  teamSchema,
  wantsRoster,
} from "./-registration.ts";

const ABOUT_FIELDS = ABOUT_DOCUMENT.fields;
const TEAM_FIELDS = TEAM_DOCUMENT.fields;

const complete = (source: string, caret: number, fields = ABOUT_FIELDS, pick = 0) => {
  const state = completionsAt(source, caret, fields)!;
  const choice = state.items[pick];

  return {
    next: source.slice(0, state.start) + choice.insert + source.slice(state.end),
    caret: state.start + choice.caret,
    labels: state.items.map((item) => item.label),
  };
};

const VALID_ABOUT = `{
  "name": "Ethen Tseggai",
  "school": "GSMST",
  "schoolEmail": "ethen.tseggai0425@gsmst.org",
  "grade": "11th",
  "team": "solo"
}`;

const VALID_TEAM = `{
  "team": "Segfault",
  "teammates": [
    { "name": "Emiliano Huerta", "school": "GSMST" },
    { "name": "", "school": "" }
  ]
}`;

// -- jsonc ------------------------------------------------------------------

test("comments and trailing commas are blanked, not deleted", () => {
  const source = '{\n  // a note\n  "name": "Ada",\n}';
  const stripped = toStrictJson(source);

  expect(stripped).toHaveLength(source.length);
  expect(stripped.split("\n")).toHaveLength(source.split("\n").length);
  expect(JSON.parse(stripped)).toEqual({ name: "Ada" });
});

test("a // inside a string is not a comment", () => {
  expect(JSON.parse(toStrictJson('{"school": "https://gsmst.org"}'))).toEqual({
    school: "https://gsmst.org",
  });
});

test("keys, values and comments tokenize apart", () => {
  const kinds = tokenize('{ // hi\n"name": "Ada" }').map((token) => token.kind);
  expect(kinds).toEqual(["punct", "comment", "key", "punct", "string", "punct"]);
});

test("locate finds nested values by dotted path", () => {
  const { spans } = locate(VALID_TEAM);
  const school = spans.get("teammates.0.school")!;

  expect(VALID_TEAM.slice(school.valueStart, school.valueEnd)).toBe('"GSMST"');
  expect(VALID_TEAM.slice(school.keyStart, school.keyEnd)).toBe('"school"');
});

test("format keeps comments and inlines short objects", () => {
  const messy = `// header\n{"team":"Segfault","teammates":[\n// Teammate #1\n{"name":"Grace","school":"GSMST"}]}`;
  const pretty = format(messy);

  expect(pretty).toContain("// header");
  expect(pretty).toContain("// Teammate #1");
  expect(pretty).toContain('{ "name": "Grace", "school": "GSMST" }');
  expect(JSON.parse(toStrictJson(pretty))).toEqual(JSON.parse(toStrictJson(messy)));
});

test("format leaves a broken document alone", () => {
  const broken = '{ "name": "Ada"';
  expect(format(broken)).toBe(broken);
});

test("both boilerplates are already formatted", () => {
  expect(format(ABOUT_DOCUMENT.boilerplate)).toBe(ABOUT_DOCUMENT.boilerplate);
  expect(format(TEAM_DOCUMENT.boilerplate)).toBe(TEAM_DOCUMENT.boilerplate);
});

// -- enter ------------------------------------------------------------------

test("enter closes off the line it is leaving with a comma", () => {
  const source = '{\n  "name": "Ada"\n}';
  expect(newlineEdit(source, source.indexOf('"Ada"') + 5).insert).toBe(",\n  ");
});

test("enter adds no comma before a closing brace, or after one already there", () => {
  const closing = '{\n  "name": "Ada"\n}';
  // caret on the blank line the boilerplate's closing brace sits on
  expect(newlineEdit(closing, closing.length - 1).insert).not.toContain(",");

  const already = '{\n  "name": "Ada",\n}';
  expect(newlineEdit(already, already.indexOf(",") + 1).insert).toBe("\n  ");
});

test("enter adds no comma after a comment or an opener, and indents into the opener", () => {
  const comment = "// a note";
  expect(newlineEdit(comment, comment.length).insert).toBe("\n");

  const opener = '{\n  "teammates": [';
  expect(newlineEdit(opener, opener.length).insert).toBe("\n    ");
});

// -- diagnostics ------------------------------------------------------------

test("answers that were never filled in stay out of the way until review", () => {
  const analysis = diagnose(ABOUT_DOCUMENT.boilerplate, aboutSchema);

  expect(analysis.visible).toHaveLength(0);
  expect(analysis.all.every((issue) => issue.missing)).toBe(true);
  expect(analysis.all.map((issue) => issue.path)).toContain("schoolEmail");
});

test("a value that is written but wrong shows immediately", () => {
  const source = VALID_ABOUT.replace("ethen.tseggai0425@gsmst.org", "nope");
  const analysis = diagnose(source, aboutSchema);

  expect(analysis.visible).toHaveLength(1);
  expect(source.slice(analysis.visible[0].start, analysis.visible[0].end)).toBe('"nope"');
});

test("a missing comma reads as english, on the right line", () => {
  const source = '{\n  "name": "Ada"\n  "school": "GSMST"\n}';
  const issue = diagnose(source, aboutSchema).visible[0];

  expect(issue.message).toBe("add a comma at the end of the line above");
  expect(issue.line).toBe(3);
});

test("a typo'd key is called out by name and underlined", () => {
  const source = '{\n  "nmae": "Ada"\n}';
  const typo = diagnose(source, aboutSchema).visible.find((issue) =>
    issue.message.includes("nmae"),
  )!;

  expect(source.slice(typo.start, typo.end)).toBe('"nmae"');
});

test("parseLoose reads a half-finished document", () => {
  expect(parseLoose('{ "team": "friends", // mine\n }')).toEqual({ team: "friends" });
  expect(parseLoose("{ oops")).toBeUndefined();
});

// -- completions ------------------------------------------------------------

test("a key completion replaces the whole token, not just up to the caret", () => {
  const source = '{\n  "nam": ""\n}';
  // caret sits between the "n" and the "a", the way it does when you fix a typo mid-word
  const { next } = complete(source, source.indexOf('"nam"') + 2);

  expect(next).toContain('"name": ""');
  expect(next).not.toContain("namame");
});

test("keys already in the document are not suggested again", () => {
  const source = '{\n  "name": "Ada",\n  "n"\n}';
  expect(completionsAt(source, source.lastIndexOf('"n"') + 2, ABOUT_FIELDS)).toBeUndefined();
});

test("enum values complete after the colon", () => {
  const source = '{\n  "grade": "1"\n}';
  const { next, labels } = complete(source, source.indexOf('"1"') + 2);

  expect(labels).toEqual(["10th", "11th", "12th"]);
  expect(next).toContain('"grade": "10th"');
});

test("completing right after a trailing comma starts a new line", () => {
  const source = '{\n  "name": "Ada",\n}';
  const caret = source.indexOf(",") + 1;
  const { next } = complete(source, caret, ABOUT_FIELDS, 1);

  expect(next).not.toContain('"Ada","');
  expect(next.split("\n")[2].trim()).toMatch(/^"school": ""/);
  expect(JSON.parse(toStrictJson(next))).toHaveProperty("school");
});

test("completions carry no comment of their own (W alliteration). the tooltip does that", () => {
  const source = '{\n  "name": "Ada",\n  \n}';
  const { next } = complete(source, source.length - 2);

  expect(next).not.toContain("//");
});

test("the caret lands inside the inserted value", () => {
  const source = '{\n  "name": "Ada",\n  \n}';
  const { next, caret } = complete(source, source.length - 2);

  expect(next.slice(caret - 1, caret + 1)).toBe('""');
});

test("inside a teammate entry, only the teammate fields are offered", () => {
  const source = '{\n  "team": "S",\n  "teammates": [\n    { "na" }\n  ]\n}';
  const labels = completionsAt(source, source.indexOf('"na"') + 3, TEAM_FIELDS)!.items.map(
    (item) => item.label,
  );

  expect(labels).toEqual(["name"]);
});

test("an array field completes with brackets, not quotes", () => {
  const source = '{\n  "team": "S",\n  "teamm"\n}';
  const { next } = complete(source, source.indexOf('"teamm"') + 6, TEAM_FIELDS);

  expect(next).toContain('"teammates": []');
});

// -- prefill ----------------------------------------------------------------

test("a valid about document builds the prefill", () => {
  const url = new URL(buildPrefillUrl(diagnose(VALID_ABOUT, aboutSchema).value!));

  expect(url.searchParams.get("usp")).toBe("pp_url");
  expect(url.searchParams.get("entry.1150302860")).toBe("Ethen Tseggai");
  expect(url.searchParams.get("entry.521603961")).toBe("GSMST");
  expect(url.searchParams.get("entry.1068002100")).toBe("ethen.tseggai0425@gsmst.org");
  expect(url.searchParams.get("entry.1541810057")).toBe("11th");
  expect(url.searchParams.get("entry.138698166")).toBe("I'm working on my own");
  // preferredName was left out, so it must not be sent at all
  expect(url.searchParams.has("entry.1374666144")).toBe(false);
  expect(url.searchParams.has("entry.832063502")).toBe(false);
});

test("team.json only unlocks for the choose-my-teammates answer", () => {
  expect(wantsRoster({ team: "friends" })).toBe(true);
  expect(wantsRoster({ team: "solo" })).toBe(false);
  expect(wantsRoster(undefined)).toBe(false);
});

test("blank teammate slots are how a smaller team is written", () => {
  const analysis = diagnose(VALID_TEAM, teamSchema);
  expect(analysis.all).toHaveLength(0);

  const about = diagnose(VALID_ABOUT.replace('"solo"', '"friends"'), aboutSchema).value!;
  const url = new URL(buildPrefillUrl(about, analysis.value!));

  expect(url.searchParams.get("entry.138698166")).toBe("I want to choose my teammates");
  expect(url.searchParams.get("entry.832063502")).toBe("Segfault");
  expect(url.searchParams.get("entry.859848346")).toBe("Emiliano Huerta");
  expect(url.searchParams.get("entry.2123245281")).toBe("GSMST");
  // the untouched slot never reaches the form
  expect(url.searchParams.has("entry.1965091872")).toBe(false);
  expect(url.searchParams.has("entry.1430270724")).toBe(false);
});

test("a filled roster fills every teammate entry in order", () => {
  const source = VALID_TEAM.replace(
    '{ "name": "", "school": "" }',
    '{ "name": "Alan Turing", "school": "Brookwood" }',
  );
  const about = diagnose(VALID_ABOUT.replace('"solo"', '"friends"'), aboutSchema).value!;
  const url = new URL(buildPrefillUrl(about, diagnose(source, teamSchema).value!));

  expect(url.searchParams.get("entry.859848346")).toBe("Emiliano Huerta");
  expect(url.searchParams.get("entry.1965091872")).toBe("Alan Turing");
  expect(url.searchParams.get("entry.1430270724")).toBe("Brookwood");
});

test("half a teammate is flagged on the half that's missing, and underlined there", () => {
  const source = VALID_TEAM.replace(
    '{ "name": "", "school": "" }',
    '{ "name": "Alan", "school": "" }',
  );
  const issue = diagnose(source, teamSchema).all.find((entry) => entry.path?.endsWith("school"))!;

  expect(issue.path).toBe("teammates.1.school");
  expect(issue.missing).toBe(true);
  expect(source.slice(issue.start, issue.end)).toBe('""');
});

test("team.json's boilerplate keeps quiet until review, then asks for one teammate", () => {
  const analysis = diagnose(TEAM_DOCUMENT.boilerplate, teamSchema);

  expect(analysis.visible).toHaveLength(0);
  expect(analysis.all.some((issue) => issue.message.includes("at least one teammate"))).toBe(true);
});

test("more than three teammates is rejected", () => {
  const roster = Array.from(
    { length: MAX_TEAMMATES + 1 },
    () => '{ "name": "A B", "school": "C D" }',
  );
  const source = `{ "team": "Segfault", "teammates": [${roster.join(",")}] }`;

  expect(diagnose(source, teamSchema).all[0].message).toContain("at most");
});

// -- this round's bugs ------------------------------------------------------

test("accepting a completion on an unterminated string leaves the closing brace alone", () => {
  const source = '{\n  "name": "Ada",\n  "sch\n}';
  const state = completionsAt(source, source.indexOf('"sch') + 4, ABOUT_FIELDS)!;
  const next = source.slice(0, state.start) + state.items[0].insert + source.slice(state.end);

  expect(next.trimEnd().endsWith("}")).toBe(true);
  expect(JSON.parse(toStrictJson(next))).toHaveProperty("school");
});

test("a field already written further down is not suggested at the top of the object", () => {
  const source = '{\n  "",\n  "school": "GSMST"\n}';
  const labels = completionsAt(source, source.indexOf('""') + 1, ABOUT_FIELDS)!.items.map(
    (item) => item.label,
  );

  expect(labels).not.toContain("school");
  expect(labels).toContain("name");
});

test("a parse error still lands on the right line when the engine gives no position", () => {
  const source = '// a note\n{\n  "name": "Ada"\n  "school": "GSMST"\n}';
  const { failure } = locate(source);

  expect(failure).toBeDefined();
  expect(source.slice(0, failure).split("\n")).toHaveLength(4);
});

test("enter inside a string steps out of it before breaking the line", () => {
  const source = '{\n  "team": "Segfault"\n}';
  const caret = source.indexOf("Segfault") + "Segfault".length;
  const edit = newlineEdit(source, caret);

  // splices after the closing quote, so the string is never split in half
  expect(source[edit.at - 1]).toBe('"');
  expect(edit.insert).toBe(",\n  ");
});

test("shift+tab outdents from anywhere on the line", () => {
  const source = '{\n    "name": "Ada"\n}';
  const caret = source.indexOf("Ada");
  const outdent = outdentEdit(source, caret)!;

  expect(outdent.next).toContain('\n  "name"');
  expect(outdent.caret).toBe(caret - 2);
  expect(outdentEdit('{"a": 1}', 3)).toBeUndefined();
});

test("brackets match from either side of the caret", () => {
  const source = '{\n  "teammates": []\n}';
  const open = source.indexOf("[");

  expect(matchingBrackets(source, open)).toEqual([open, open + 1]);
  expect(matchingBrackets(source, 0)).toEqual([0, source.length - 1]);
  // a brace inside a string or a comment is not a bracket
  expect(matchingBrackets('{ "a": "}" }', 8)).toBeUndefined();
});

test("jumping to a quoted value lands inside the quotes", () => {
  const source = VALID_ABOUT.replace("ethen.tseggai0425@gsmst.org", "nope");
  const issue = diagnose(source, aboutSchema).visible[0];

  expect(source.slice(...selectionOf(issue))).toBe("nope");
});
