import { stringToken, tokenize } from "./-jsonc.ts";
import type { FieldDoc } from "./-registration.ts";

/** Just enough of a JSON language service to suggest the field names and enum values. */

export interface Completion {
  label: string;
  detail?: string;
  /** replaces [start, end) in the source */
  insert: string;
  /** caret offset inside `insert` once applied */
  caret: number;
}

export interface CompletionState {
  items: Completion[];
  start: number;
  end: number;
}

interface Scan {
  inString: boolean;
  stringStart: number;
  container: string[];
  siblings: Set<string>;
}

interface Frame {
  key?: string;
  keys: Set<string>;
  start: number;
  end: number;
}

function scan(source: string, caret: number): Scan {
  const root: Frame = { keys: new Set(), start: 0, end: source.length };
  const frames: Frame[] = [root];
  const open: Frame[] = [root];

  let inString = false;
  let stringStart = -1;
  let pendingKey: string | undefined;

  for (let index = 0; index < source.length; index++) {
    const char = source[index];

    if (char === '"') {
      const token = stringToken(source, index);

      // an unterminated string owns its line break too, so a caret parked at the end of
      // `"sch` is still inside the token rather than out in the object
      const reaches = token.terminated ? token.end > caret : token.end >= caret;
      if (index < caret && reaches) {
        inString = true;
        stringStart = index;
      }

      // a string followed by a colon is a key
      if (/^\s*:/.test(source.slice(token.end))) {
        pendingKey = source.slice(index + 1, token.end - (token.terminated ? 1 : 0));
        open.at(-1)?.keys.add(pendingKey);
      }

      index = token.end - 1;
      continue;
    }

    if (char === "/" && source[index + 1] === "/") {
      const newline = source.indexOf("\n", index);
      index = (newline === -1 ? source.length : newline) - 1;
      continue;
    }

    if (char === "{" || char === "[") {
      const frame: Frame = { key: pendingKey, keys: new Set(), start: index, end: source.length };
      pendingKey = undefined;
      frames.push(frame);
      open.push(frame);
      continue;
    }

    if (char === "}" || char === "]") {
      const frame = open.pop();
      if (frame) frame.end = index;
      if (!open.length) open.push(root);
      continue;
    }
  }

  // the innermost container that still holds the caret
  const enclosing = frames.filter(
    (frame) => frame !== root && frame.start < caret && caret <= frame.end,
  );
  const innermost = enclosing.at(-1) ?? root;

  return {
    inString,
    stringStart,
    container: enclosing.map((frame) => frame.key).filter((key): key is string => Boolean(key)),
    siblings: innermost.keys,
  };
}

function fieldsFor(roots: readonly FieldDoc[], container: string[]): readonly FieldDoc[] {
  let fields = roots;

  for (const key of container) {
    const next = fields.find((field) => field.key === key)?.children;
    if (!next) return key === container.at(-1) ? fields : [];
    fields = next;
  }

  return fields;
}

function prevNonSpace(source: string, from: number) {
  for (let index = from - 1; index >= 0; index--) if (!/\s/.test(source[index])) return index;
  return -1;
}

function nextNonSpace(source: string, from: number) {
  for (let index = from; index < source.length; index++)
    if (!/\s/.test(source[index])) return index;
  return -1;
}

function keyBeforeColon(source: string, colonIndex: number) {
  const end = source.lastIndexOf('"', colonIndex - 1);
  if (end < 0) return undefined;

  const start = source.lastIndexOf('"', end - 1);
  if (start < 0) return undefined;

  return source.slice(start + 1, end);
}

function matches(candidate: string, prefix: string) {
  return candidate.toLowerCase().startsWith(prefix.toLowerCase());
}

function ownLineIndent(source: string, from: number) {
  const lineStart = source.lastIndexOf("\n", from - 1) + 1;
  const before = source.slice(lineStart, from);

  return /^\s*$/.test(before) ? before : undefined;
}

function stub(field: FieldDoc): string {
  if (field.type === "object[]") return "[]";
  if (field.type === "object") return "{}";
  return '""';
}

/** fields already passed over (something later in the list got filled first) sink to the bottom */
function bySkips(fields: readonly FieldDoc[], siblings: Set<string>): readonly FieldDoc[] {
  const lastFilled = fields.reduce(
    (last, field, index) => (siblings.has(field.key) ? index : last),
    -1,
  );
  if (lastFilled < 0) return fields;

  const upNext = fields.filter((_, index) => index > lastFilled);
  const skipped = fields.filter((field, index) => index < lastFilled && !siblings.has(field.key));

  return [...upNext, ...skipped];
}

/** true when the caret sits inside a comment, where a preceding `,` or `{` from the real JSON
 *  shouldn't be read as "a new member is legal here" */
function inComment(source: string, caret: number): boolean {
  return tokenize(source).some(
    (token) => token.kind === "comment" && token.start <= caret && caret < token.end,
  );
}

export function completionsAt(
  source: string,
  caret: number,
  roots: readonly FieldDoc[],
): CompletionState | undefined {
  if (inComment(source, caret)) return undefined;

  const { inString, stringStart, container, siblings } = scan(source, caret);
  const fields = fieldsFor(roots, container);
  if (!fields.length) return undefined;

  if (inString) {
    const { end: stringEnd, terminated } = stringToken(source, stringStart);
    const token = source.slice(stringStart + 1, stringEnd - (terminated ? 1 : 0));
    const prefix = source.slice(stringStart + 1, caret);
    const before = prevNonSpace(source, stringStart);
    const beforeChar = before >= 0 ? source[before] : "";

    if (beforeChar === ":") {
      const key = keyBeforeColon(source, before);
      const field = fields.find((entry) => entry.key === key);
      if (!field?.values) return undefined;

      const items = field.values
        .filter((value) => matches(value, prefix))
        .map((value) => ({ label: value, insert: `"${value}"`, caret: value.length + 2 }));

      return items.length ? { items, start: stringStart, end: stringEnd } : undefined;
    }

    const following = nextNonSpace(source, stringEnd);
    const needsColon = following < 0 || source[following] !== ":";

    const items = bySkips(fields, siblings)
      .filter(
        (field) => matches(field.key, prefix) && (!siblings.has(field.key) || field.key === token),
      )
      .map((field) => ({
        label: field.key,
        detail: field.hint,
        insert: needsColon ? `"${field.key}": ${stub(field)}` : `"${field.key}"`,
        caret: needsColon ? field.key.length + 4 + stub(field).length - 1 : field.key.length + 2,
      }));

    return items.length ? { items, start: stringStart, end: stringEnd } : undefined;
  }

  // outside a string, a whole member can be dropped in wherever one would be legal — even one
  // typed bare, with the quotes left off, like `team` instead of `"team"`
  const bareKey = /[A-Za-z0-9_$]*$/.exec(source.slice(0, caret))?.[0] ?? "";
  const keyStart = caret - bareKey.length;

  const before = prevNonSpace(source, keyStart);
  const beforeChar = before >= 0 ? source[before] : "";
  if (beforeChar !== "{" && beforeChar !== ",") return undefined;

  const after = nextNonSpace(source, caret);
  const suffix = after >= 0 && source[after] === '"' ? "," : "";

  // after a comma the new member belongs on its own line, not shoulder to shoulder with the last
  const indent = ownLineIndent(source, keyStart);
  const lead = indent === undefined ? `\n${" ".repeat(caretColumnIndent(source, before))}` : "";

  const items = bySkips(fields, siblings)
    .filter((field) => !siblings.has(field.key) && matches(field.key, bareKey))
    .map((field) => {
      const body = `"${field.key}": ${stub(field)}${suffix}`;
      return {
        label: field.key,
        detail: field.hint,
        insert: lead + body,
        caret: lead.length + field.key.length + 4 + stub(field).length - 1,
      };
    });

  return items.length ? { items, start: keyStart, end: caret } : undefined;
}

/** the indent of the line the previous token sits on, so a new line matches its siblings */
function caretColumnIndent(source: string, from: number): number {
  const lineStart = source.lastIndexOf("\n", from) + 1;
  return /^[ \t]*/.exec(source.slice(lineStart))?.[0].length ?? 2;
}
