import { locate, toStrictJson, type Span } from "./-jsonc.ts";

// o why is jsonc not the standard...

export interface Diagnostic {
  line: number;
  column: number;
  message: string;
  start: number;
  end: number;
  path?: string;
  missing?: boolean;
  selection?: { start: number; end: number };
}

export interface Analysis<T> {
  all: Diagnostic[];
  visible: Diagnostic[];
  value?: T;
}

interface Schema<T> {
  safeParse: (input: unknown) => {
    success: boolean;
    data?: T;
    error?: { issues: Array<{ message: string; path: PropertyKey[]; keys?: string[] }> };
  };
}

/** JSON.parse's wording assumes you know the grammar; these don't */
const PARSE_HINTS: [RegExp, string][] = [
  [/expected ',' or ['}\]]/i, "add a comma at the end of the line above"],
  [/expected property name or '}'/i, "expected a property name here, in quotes"],
  [/expected double-quoted property name/i, "property names go in double quotes"],
  [
    /(unexpected end of|end of data|expected '}')/i,
    "add a comma above, or close the object with }",
  ],
  [/expected ']'/i, "add a comma above, or close the list with ]"],
  [/expected ':'/i, "a property name is followed by a colon"],
  [/unterminated string/i, "this string is missing its closing quote"],
];

export function positionAt(source: string, offset: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(offset, source.length));
  const before = source.slice(0, clamped);

  return {
    line: before.split("\n").length,
    column: clamped - (before.lastIndexOf("\n") + 1) + 1,
  };
}

/** safari doesn't put the offset in the message, which is why this is necessary */
function parseOffset(source: string, message: string): number {
  const reported = /at position (\d+)/.exec(message)?.[1];
  return reported ? Number(reported) : (locate(source).failure ?? 0);
}

function explain(message: string): string {
  const hint = PARSE_HINTS.find(([pattern]) => pattern.test(message));
  if (hint) return hint[1];

  return message.replace(/\s*in JSON at position.*$/, "").toLowerCase();
}

function only(source: string, diagnostic: Omit<Diagnostic, "line" | "column">): Analysis<never> {
  const entry = { ...positionAt(source, diagnostic.start), ...diagnostic };
  return { all: [entry], visible: [entry] };
}

export function parseLoose(source: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(toStrictJson(source));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isBlank(source: string, span: Span): boolean {
  return source.slice(span.valueStart, span.valueEnd).trim() === '""';
}

function insideQuotes(source: string, start: number, end: number) {
  const text = source.slice(start, end);
  if (text.length < 2 || !text.startsWith('"') || !text.endsWith('"')) return undefined;

  return { start: start + 1, end: end - 1 };
}

export function selectionOf(issue: Diagnostic): [number, number] {
  return [issue.selection?.start ?? issue.start, issue.selection?.end ?? issue.end];
}

export function diagnose<T>(source: string, schema: Schema<T>): Analysis<T> {
  if (!source.trim()) {
    return only(source, { message: "the document is empty", start: 0, end: 0 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(toStrictJson(source));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const offset = parseOffset(source, message);

    return only(source, {
      message: explain(message),
      start: offset,
      end: Math.min(offset + 1, source.length),
    });
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return only(source, { message: "expected an object, like { ... }", start: 0, end: 1 });
  }

  const result = schema.safeParse(parsed);
  if (result.success) return { all: [], visible: [], value: result.data };

  const { spans } = locate(source);
  const all: Diagnostic[] = [];

  const tail = Math.max(0, source.lastIndexOf("}"));

  for (const issue of result.error?.issues ?? []) {
    // unrecognized_keys reports the typo'd names instead of a path, so it gets one line eachh
    const targets = issue.keys?.length ? issue.keys : [issue.path.map(String).join(".")];
    const isUnknownKey = Boolean(issue.keys?.length);

    for (const target of targets) {
      const prefix = issue.path.slice(0, -1).map(String).join(".");
      const path = isUnknownKey && prefix ? `${prefix}.${target}` : target;
      const span = path ? spans.get(path) : undefined;
      const pointAtKey = isUnknownKey || !span;

      const start = span ? (pointAtKey ? span.keyStart : span.valueStart) : tail;
      const end = span ? (pointAtKey ? span.keyEnd : span.valueEnd) : tail;

      all.push({
        ...positionAt(source, start),
        message: isUnknownKey ? `"${target}" is not a field on this form` : issue.message,
        start,
        end,
        path: path || undefined,
        missing: !span || (!isUnknownKey && isBlank(source, span)),
        selection: insideQuotes(source, start, end),
      });
    }
  }

  all.sort((a, b) => a.start - b.start);

  return { all, visible: all.filter((issue) => !issue.missing) };
}
