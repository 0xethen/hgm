export type TokenKind = "key" | "string" | "number" | "literal" | "punct" | "comment";

export interface Token {
  start: number;
  end: number;
  kind: TokenKind;
}

export interface Span {
  keyStart: number;
  keyEnd: number;
  valueStart: number;
  valueEnd: number;
}

const LITERALS = ["true", "false", "null"];
const INDENT = "  ";
const INLINE_WIDTH = 52;

export interface StringToken {
  end: number;
  terminated: boolean;
}

export function stringToken(source: string, start: number): StringToken {
  let index = start + 1;

  while (index < source.length) {
    if (source[index] === "\\") index += 2;
    else if (source[index] === '"') return { end: index + 1, terminated: true };
    else if (source[index] === "\n") return { end: index, terminated: false };
    else index++;
  }

  return { end: source.length, terminated: false };
}

/** end offset of the string starting at `start` (the opening quote), past its closing quote */
export function endOfString(source: string, start: number): number {
  return stringToken(source, start).end;
}

function endOfLineComment(source: string, start: number): number {
  const newline = source.indexOf("\n", start);
  return newline === -1 ? source.length : newline;
}

function endOfBlockComment(source: string, start: number): number {
  const close = source.indexOf("*/", start + 2);
  return close === -1 ? source.length : close + 2;
}

function blank(text: string): string {
  // newlines survive so line numbers don't shift
  return text.replace(/[^\n]/g, " ");
}

// allows json.parse to succeed (no comments mostly)
export function toStrictJson(source: string): string {
  let out = "";
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (char === '"') {
      const end = endOfString(source, index);
      out += source.slice(index, end);
      index = end;
      continue;
    }

    if (char === "/" && (source[index + 1] === "/" || source[index + 1] === "*")) {
      const end =
        source[index + 1] === "/"
          ? endOfLineComment(source, index)
          : endOfBlockComment(source, index);

      out += blank(source.slice(index, end));
      index = end;
      continue;
    }

    out += char;
    index++;
  }

  // a comma with nothing but whitespace between it and its closing brace is a typo, not an error
  return out.replace(/,(\s*[}\]])/g, " $1");
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (char === '"') {
      const end = endOfString(source, index);
      // a string is a key when the next meaningful character is a colon
      const rest = source.slice(end);
      const kind: TokenKind = /^\s*(\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*:/.test(rest)
        ? "key"
        : "string";

      tokens.push({ start: index, end, kind });
      index = end;
      continue;
    }

    if (char === "/" && (source[index + 1] === "/" || source[index + 1] === "*")) {
      const end =
        source[index + 1] === "/"
          ? endOfLineComment(source, index)
          : endOfBlockComment(source, index);

      tokens.push({ start: index, end, kind: "comment" });
      index = end;
      continue;
    }

    if (char === "-" || (char >= "0" && char <= "9")) {
      const match = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(source.slice(index));
      const end = index + (match?.[0].length || 1);

      tokens.push({ start: index, end, kind: "number" });
      index = end;
      continue;
    }

    const literal = LITERALS.find((word) => source.startsWith(word, index));
    if (literal) {
      tokens.push({ start: index, end: index + literal.length, kind: "literal" });
      index += literal.length;
      continue;
    }

    if (!/\s/.test(char)) tokens.push({ start: index, end: index + 1, kind: "punct" });
    index++;
  }

  return tokens;
}

export function locate(source: string): { spans: Map<string, Span>; failure?: number } {
  const text = toStrictJson(source);
  const spans = new Map<string, Span>();
  let failure: number | undefined;
  let index = 0;

  const bail = () => {
    failure ??= index;
  };

  const skipSpace = () => {
    while (index < text.length && /\s/.test(text[index])) index++;
  };

  const readKey = (): string | undefined => {
    if (text[index] !== '"') return undefined;

    const start = index;
    index = endOfString(text, index);

    try {
      return JSON.parse(text.slice(start, index)) as string;
    } catch {
      return text.slice(start + 1, index - 1);
    }
  };

  const readValue = (path: string) => {
    skipSpace();

    if (text[index] === "{") {
      index++;
      readObject(path);
    } else if (text[index] === "[") {
      index++;
      readArray(path);
    } else if (text[index] === '"') {
      index = endOfString(text, index);
    } else {
      while (index < text.length && !/[,\]}\s]/.test(text[index])) index++;
    }
  };

  function readObject(path: string) {
    skipSpace();
    if (text[index] === "}") return void index++;

    while (index < text.length) {
      skipSpace();

      const keyStart = index;
      const key = readKey();
      if (key === undefined) return bail();

      const keyEnd = index;
      skipSpace();
      if (text[index] !== ":") return bail();

      index++;
      skipSpace();

      const valueStart = index;
      const child = path ? `${path}.${key}` : key;
      readValue(child);

      spans.set(child, { keyStart, keyEnd, valueStart, valueEnd: index });

      skipSpace();
      if (text[index] === ",") index++;
      else if (text[index] === "}") return void index++;
      else return bail();
    }
  }

  function readArray(path: string) {
    skipSpace();
    if (text[index] === "]") return void index++;

    for (let slot = 0; index < text.length; slot++) {
      skipSpace();

      const valueStart = index;
      readValue(`${path}.${slot}`);

      spans.set(`${path}.${slot}`, {
        keyStart: valueStart,
        keyEnd: valueStart,
        valueStart,
        valueEnd: index,
      });

      skipSpace();
      if (text[index] === ",") index++;
      else if (text[index] === "]") return void index++;
      else return bail();
    }
  }

  skipSpace();
  readValue("");

  return { spans, failure };
}

type Node =
  | { kind: "scalar"; text: string }
  | {
      kind: "object" | "array";
      members: Member[];
      trailing: string[];
      /** the author left a comma dangling after the last member; keep it, don't "fix" it away */
      danglingComma: boolean;
    };

interface Member {
  comments: string[];
  key?: string;
  value: Node;
  /** an author put a blank line above this member (a paragraph break); worth keeping regardless of file shape */
  blankBefore: boolean;
}

/** more than one line break between two offsets means the author left a blank line there */
function hasBlankLine(source: string, from: number, to: number): boolean {
  return (source.slice(from, to).match(/\n/g)?.length ?? 0) > 1;
}

function render(node: Node, depth: number): string {
  if (node.kind === "scalar") return node.text;

  const [open, close] = node.kind === "object" ? ["{", "}"] : ["[", "]"];
  if (!node.members.length && !node.trailing.length) return `${open}${close}`;

  const pad = INDENT.repeat(depth + 1);
  const parts = node.members.map(
    (member) => (member.key ? `${member.key}: ` : "") + render(member.value, depth + 1),
  );

  const inline = `${open} ${parts.join(", ")} ${close}`;
  const hasComments = node.members.some((member) => member.comments.length) || node.trailing.length;
  const hasBlankLines = node.members.some((member) => member.blankBefore);

  if (
    depth > 0 &&
    !hasComments &&
    !hasBlankLines &&
    !inline.includes("\n") &&
    inline.length + pad.length <= INLINE_WIDTH
  ) {
    return inline;
  }

  const lines = node.members.map(
    (member, position) =>
      (member.blankBefore && position > 0 ? "\n" : "") +
      member.comments.map((comment) => pad + comment + "\n").join("") +
      pad +
      parts[position] +
      (position < node.members.length - 1 || node.danglingComma ? "," : ""),
  );

  return [
    open,
    ...lines,
    ...node.trailing.map((comment) => pad + comment),
    INDENT.repeat(depth) + close,
  ].join("\n");
}

export function format(source: string): string {
  const tokens = tokenize(source);
  let cursor = 0;

  const text = (token: Token) => source.slice(token.start, token.end);
  const peek = () => tokens[cursor];

  const takeComments = (): string[] => {
    const comments: string[] = [];
    while (peek()?.kind === "comment") comments.push(text(tokens[cursor++]));
    return comments;
  };

  function parseValue(): Node {
    const token = peek();
    if (!token) return { kind: "scalar", text: "null" };

    if (token.kind === "punct" && text(token) === "{") {
      cursor++;
      return parseBody("object", "}");
    }

    if (token.kind === "punct" && text(token) === "[") {
      cursor++;
      return parseBody("array", "]");
    }

    cursor++;
    return { kind: "scalar", text: text(token) };
  }

  function parseBody(kind: "object" | "array", closer: string): Node {
    const members: Member[] = [];
    // the opener (`{`/`[`) or `,` just consumed by the caller
    let prevEnd = tokens[cursor - 1]?.end ?? 0;
    let danglingComma = false;

    for (;;) {
      const blankBefore = peek() ? hasBlankLine(source, prevEnd, peek()!.start) : false;
      const comments = takeComments();
      const token = peek();

      if (!token || (token.kind === "punct" && text(token) === closer)) {
        cursor++;
        return { kind, members, trailing: comments, danglingComma };
      }

      if (token.kind === "punct" && text(token) === ",") {
        cursor++;
        prevEnd = token.end;
        danglingComma = true;
        continue;
      }

      danglingComma = false;

      if (kind === "object") {
        const key = text(tokens[cursor++]);
        // step over the colon
        if (peek()?.kind === "punct" && text(peek()) === ":") cursor++;
        members.push({ comments, key, value: parseValue(), blankBefore });
      } else {
        members.push({ comments, value: parseValue(), blankBefore });
      }

      prevEnd = tokens[cursor - 1]?.end ?? prevEnd;
    }
  }

  const header = takeComments();
  const afterHeader = tokens[cursor - 1]?.end ?? 0;
  const blankAfterHeader = peek() ? hasBlankLine(source, afterHeader, peek()!.start) : false;

  const root = parseValue();
  const afterRoot = tokens[cursor - 1]?.end ?? afterHeader;
  const blankBeforeTail = peek() ? hasBlankLine(source, afterRoot, peek()!.start) : false;

  const tail = takeComments();

  const formatted = [
    ...header,
    ...(blankAfterHeader ? [""] : []),
    render(root, 0),
    ...(blankBeforeTail ? [""] : []),
    ...tail,
  ].join("\n");

  // never hand back something that stopped being the same document
  try {
    const before = JSON.parse(toStrictJson(source));
    const after = JSON.parse(toStrictJson(formatted));
    if (JSON.stringify(before) !== JSON.stringify(after)) return source;
  } catch {
    return source;
  }

  return formatted;
}

const INDENT_UNIT = "  ";
const ENDS_A_VALUE = /["\]}\d]$|\b(true|false|null)$/;

const OPENERS = "{[";
const CLOSERS = "}]";

/** comments and string contents blanked out, so a brace inside either is never a bracket */
function maskLiterals(source: string): string {
  let out = "";
  let index = 0;

  while (index < source.length) {
    if (source[index] === '"') {
      const { end } = stringToken(source, index);
      out += blank(source.slice(index, end));
      index = end;
      continue;
    }

    if (source[index] === "/" && (source[index + 1] === "/" || source[index + 1] === "*")) {
      const end =
        source[index + 1] === "/"
          ? endOfLineComment(source, index)
          : endOfBlockComment(source, index);

      out += blank(source.slice(index, end));
      index = end;
      continue;
    }

    out += source[index];
    index++;
  }

  return out;
}

export function matchingBrackets(source: string, caret: number): [number, number] | undefined {
  const text = maskLiterals(source);

  for (const index of [caret, caret - 1]) {
    const char = text[index];
    if (!char) continue;

    const opening = OPENERS.indexOf(char);
    const closing = CLOSERS.indexOf(char);
    if (opening < 0 && closing < 0) continue;

    const step = opening >= 0 ? 1 : -1;
    const wanted = opening >= 0 ? CLOSERS[opening] : OPENERS[closing];
    let depth = 0;

    for (let scan = index; scan >= 0 && scan < text.length; scan += step) {
      if (text[scan] === char) depth++;
      else if (text[scan] === wanted && --depth === 0) return [index, scan];
    }
  }

  return undefined;
}

function escapeString(source: string, caret: number): number {
  let index = 0;

  while (index < caret) {
    if (source[index] === '"') {
      const token = stringToken(source, index);
      if (token.end > caret) return token.terminated ? token.end : caret;
      index = token.end;
      continue;
    }

    index++;
  }

  return caret;
}

export interface Edit {
  at: number;
  insert: string;
}

// return return return
export function newlineEdit(source: string, caret: number): Edit {
  let at = escapeString(source, caret);
  // stepping out of the string can land right before a comma that's already there; breaking the
  // line before it would strand that comma alone on the next line instead of after the value
  if (source[at] === ",") at++;

  const lineStart = source.lastIndexOf("\n", at - 1) + 1;
  const head = source.slice(lineStart, at);
  const indent = /^[ \t]*/.exec(head)?.[0] ?? "";
  const trimmedHead = head.trimEnd();

  const lineEnd = source.indexOf("\n", at);
  const rest = source.slice(at, lineEnd === -1 ? source.length : lineEnd).trim();

  const comma =
    !rest && !head.trimStart().startsWith("//") && ENDS_A_VALUE.test(trimmedHead) ? "," : "";

  const deeper = /[{[]$/.test(trimmedHead) ? INDENT_UNIT : "";

  return { at, insert: `${comma}\n${indent}${deeper}` };
}

// shift+tab anywhere on a line :)
export function outdentEdit(
  source: string,
  caret: number,
): { next: string; caret: number } | undefined {
  const lineStart = source.lastIndexOf("\n", caret - 1) + 1;
  const indent = /^[ \t]*/.exec(source.slice(lineStart))?.[0] ?? "";
  if (!indent) return undefined;

  const removed = Math.min(INDENT_UNIT.length, indent.length);

  return {
    next: source.slice(0, lineStart) + source.slice(lineStart + removed),
    caret: Math.max(lineStart, caret - removed),
  };
}
