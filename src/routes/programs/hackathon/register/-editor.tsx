import * as React from "react";

import { cn } from "#/lib/utils";
import { Kbd } from "#/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { completionsAt, type CompletionState } from "./-completions.ts";
import { positionAt, type Diagnostic } from "./-diagnostics.ts";
import { matchingBrackets, newlineEdit, outdentEdit, tokenize, type TokenKind } from "./-jsonc.ts";
import { fillTemplate, type FieldDoc } from "./-registration.ts";
import { useBreakpoint } from "#/hooks/browser.ts";
import pluralize from "pluralize";

const INDENT = "  ";
const MAX_SUGGESTIONS = 6;

// team.json unlocked message shows up for {ANNOUNCE_MS}ms
const ANNOUNCE_MS = 4000;

const classNames = {
  /** the mirror and the textarea have to lay text out identically or the two drift apart.
   *  16px on phones is also what stops iOS zooming the page when the textarea takes focus. */
  textBox: "px-3 py-3 font-mono text-base md:text-sm leading-6 whitespace-pre-wrap break-words",
  squiggle: "underline decoration-wavy decoration-1 underline-offset-4 decoration-destructive-text",
  bracketMatch: "bg-primary/25 text-white",
  gutter:
    "shrink-0 bg-white/3 py-3 pr-2 pl-3 text-right font-mono text-base leading-6 text-white/25 select-none md:text-sm",
  popover: "anchored border border-white/10 bg-hg-black shadow-xl shadow-black/40",
  token: {
    key: "text-primary-light",
    string: "text-white/85",
    number: "text-sky-300/80",
    literal: "text-sky-300/80",
    punct: "text-white/30",
    comment: "text-white/30 italic",
  } satisfies Record<TokenKind, string>,
} as const;

export interface EditorTab {
  id: string;
  label: string;
  disabled?: boolean;
  /** shown on hover, and once on its own when `tooltipOpen` flips true */
  tooltip?: React.ReactNode;
  tooltipOpen?: boolean;
}

export interface JsonEditorHandle {
  select: (start: number, end: number) => void;
}

interface Piece {
  key: number;
  text: string;
  className: string;
}

function paint(
  value: string,
  diagnostics: readonly Diagnostic[],
  brackets: [number, number] | undefined,
): Piece[] {
  const marks = [
    ...tokenize(value).map((token) => ({ ...token, className: classNames.token[token.kind] })),
    ...diagnostics
      .filter((issue) => issue.end > issue.start)
      .map((issue) => ({ start: issue.start, end: issue.end, className: classNames.squiggle })),
    ...(brackets ?? []).map((at) => ({
      start: at,
      end: at + 1,
      className: classNames.bracketMatch,
    })),
  ];

  const cuts = new Set<number>([0, value.length]);
  for (const mark of marks) {
    cuts.add(Math.max(0, mark.start));
    cuts.add(Math.min(value.length, mark.end));
  }

  const points = [...cuts].sort((a, b) => a - b);
  const pieces: Piece[] = [];

  for (let index = 0; index < points.length - 1; index++) {
    const [start, end] = [points[index], points[index + 1]];
    if (start === end) continue;

    pieces.push({
      key: start,
      text: value.slice(start, end),
      className: marks
        .filter((mark) => mark.start <= start && mark.end >= end)
        .map((mark) => mark.className)
        .join(" "),
    });
  }

  return pieces;
}

export const JsonEditor = React.forwardRef<
  JsonEditorHandle,
  {
    value: string;
    onChange: (value: string) => void;
    diagnostics: readonly Diagnostic[];
    complete: boolean;
    fields: readonly FieldDoc[];
    tabs: EditorTab[];
    activeTab: string;
    onSelectTab: (id: string) => void;
  }
>(function JsonEditor(
  { value, onChange, diagnostics, complete, fields, tabs, activeTab, onSelectTab },
  ref,
) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const editorId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const { isMobileDevice } = useBreakpoint();

  const [caret, setCaret] = React.useState(0);
  const [active, setActive] = React.useState(0);
  const [dismissed, setDismissed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  // one anchor per editor
  const anchorName = `--caret-${editorId}`;

  const completions: CompletionState | undefined = React.useMemo(
    () => (dismissed || !focused ? undefined : completionsAt(value, caret, fields)),
    [dismissed, focused, value, caret, fields],
  );

  const suggestions = completions?.items.slice(0, MAX_SUGGESTIONS) ?? [];
  const index = Math.min(active, Math.max(0, suggestions.length - 1));

  const brackets = React.useMemo(
    () => (focused ? matchingBrackets(value, caret) : undefined),
    [focused, value, caret],
  );
  const pieces = React.useMemo(
    () => paint(value, diagnostics, brackets),
    [value, diagnostics, brackets],
  );

  const lines = value.split("\n");
  const brokenLines = new Set(diagnostics.map((issue) => issue.line));

  // typing JSON by hand on a phone keyboard is miserable; skip straight to the fields that exist
  React.useEffect(() => {
    if (isMobileDevice && !complete) onChange(fillTemplate(fields, value));
  }, [isMobileDevice, complete, fields, value, onChange]);

  const put = (next: string, cursor: number) => {
    onChange(next);
    setDismissed(false);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.setSelectionRange(cursor, cursor);
      setCaret(cursor);
    });
  };

  React.useImperativeHandle(ref, () => ({
    select: (start, end) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      textarea.setSelectionRange(start, end);
      setCaret(start);
      setDismissed(true);
    },
  }));

  const accept = (choiceIndex = index) => {
    const choice = completions && suggestions[choiceIndex];
    if (!completions || !choice) return false;

    put(
      value.slice(0, completions.start) + choice.insert + value.slice(completions.end),
      completions.start + choice.caret,
    );
    setActive(0);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd } = event.currentTarget;

    if (event.key === "Escape" && suggestions.length) {
      event.preventDefault();
      setDismissed(true);
      return;
    }

    if (suggestions.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setActive(
        (previous) =>
          (previous + (event.key === "ArrowDown" ? 1 : suggestions.length - 1)) %
          suggestions.length,
      );
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      if (accept()) return;

      if (event.shiftKey) {
        // outdent the line the caret is on, wherever on it the caret happens to be
        const outdent = outdentEdit(value, selectionStart);
        if (outdent) put(outdent.next, outdent.caret);
        return;
      }

      put(
        value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd),
        selectionStart + INDENT.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      // a suggestion on screen wins first, the same as Tab
      if (accept()) return;

      // keep the caret in the object, and close off the line they're leaving with a comma
      const { at, insert } = newlineEdit(value, selectionStart);

      put(
        value.slice(0, at) + insert + value.slice(Math.max(at, selectionEnd)),
        at + insert.length,
      );
    }
  };

  const syncCaret = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCaret(event.currentTarget.selectionStart);
    setActive(0);
  };

  const label = tabs.find((tab) => tab.id === activeTab)?.label ?? "";

  const issue = diagnostics.find((entry) => caret >= entry.start && caret <= entry.end);
  const hint = issue ? undefined : fieldAtCaret(value, caret, fields);
  const caretMarker = <span style={{ anchorName } as React.CSSProperties} />;

  return (
    <div className="border border-primary/40 bg-hg-black text-white focus-within:border-primary">
      <div className="flex items-stretch justify-between gap-2 border-b border-white/10">
        <div role="tablist" aria-label="Documents" className="flex min-w-0 overflow-x-auto">
          {tabs.map((tab) => (
            <EditorTabButton
              key={tab.id}
              tab={tab}
              selected={tab.id === activeTab}
              onSelect={() => onSelectTab(tab.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex">
        <div
          aria-hidden
          // a fixed character width, so 9 -> 10 lines doesn't shift the whole editor sideways
          style={{ minWidth: `calc(${Math.max(2, String(lines.length).length)}ch + 1.25rem)` }}
          className={classNames.gutter}
        >
          {lines.map((_, line) => (
            <div key={line} className={cn(brokenLines.has(line + 1) && "text-destructive-text")}>
              {line + 1}
            </div>
          ))}
        </div>

        <div className="relative min-w-0 flex-1 cursor-text">
          <pre
            aria-hidden
            className={cn(
              "pointer-events-none relative m-0 min-h-56 select-none",
              classNames.textBox,
            )}
          >
            {pieces.map((piece) =>
              piece.key <= caret && caret < piece.key + piece.text.length ? (
                // split this piece so the caret marker sits exactly where the caret does
                <React.Fragment key={piece.key}>
                  <span className={piece.className}>{piece.text.slice(0, caret - piece.key)}</span>
                  {caretMarker}
                  <span className={piece.className}>{piece.text.slice(caret - piece.key)}</span>
                </React.Fragment>
              ) : (
                <span key={piece.key} className={piece.className}>
                  {piece.text}
                </span>
              ),
            )}
            {caret >= value.length ? caretMarker : null}
            {"\u200b"}
          </pre>

          <textarea
            ref={textareaRef}
            id={`editor-${activeTab}`}
            name={activeTab}
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setCaret(event.target.selectionStart);
              setActive(0);
              setDismissed(false);
            }}
            onKeyDown={handleKeyDown}
            onSelect={syncCaret}
            onClick={syncCaret}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label={label}
            aria-invalid={diagnostics.length > 0}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(
              "absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent text-transparent outline-none",
              "caret-primary-light selection:bg-primary/40 selection:text-transparent",
              classNames.textBox,
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2 font-mono text-xs text-white/35">
        <div>
          line {positionAt(value, caret).line}, column {positionAt(value, caret).column}
          <span className="mx-2 text-muted-foreground/50">|</span>
          <span
            aria-live="polite"
            className={cn(diagnostics.length > 0 && "text-destructive-text")}
          >
            {diagnostics.length > 0
              ? `${diagnostics.length} ${pluralize("problem", diagnostics.length)}`
              : "no problems"}
          </span>
          {/*type <span className="text-primary-light">"</span> then{" "}
          <Kbd className="bg-background/10 text-background/70">⇥</Kbd> to autocomplete*/}
        </div>

        {!complete && (
          <button
            type="button"
            onClick={() => onChange(fillTemplate(fields, value))}
            className="shrink-0 text-primary-light underline-offset-2 hover:underline"
          >
            autofill {label}
          </button>
        )}
      </div>

      <Anchored open={focused && suggestions.length > 0} anchor={anchorName} className="w-72">
        <Suggestions items={suggestions} index={index} onPick={(position) => accept(position)} />
      </Anchored>

      <Anchored
        open={focused && !suggestions.length && Boolean(issue || hint)}
        anchor={anchorName}
        className={cn(
          "max-w-xs px-2 py-1 font-mono text-xs",
          issue ? "border-destructive/50 bg-red-950" : "border-hg-green/50",
        )}
      >
        <Bubble issue={issue} field={hint} />
      </Anchored>
    </div>
  );
});

/**
 * A popover pinned to the caret. `manual` because nothing here should light-dismiss it, and the
 * open state is driven imperatively since that is the only way in and out of the top layer.
 */
function Anchored({
  open,
  anchor,
  className,
  children,
}: {
  open: boolean;
  anchor: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node?.isConnected) return;

    const shown = node.matches(":popover-open");
    if (open && !shown) node.showPopover();
    else if (!open && shown) node.hidePopover();
  }, [open]);

  return (
    <div
      ref={ref}
      popover="manual"
      style={{ positionAnchor: anchor } as React.CSSProperties}
      className={cn(classNames.popover, className)}
    >
      {children}
    </div>
  );
}

function EditorTabButton({
  tab,
  selected,
  onSelect,
}: {
  tab: EditorTab;
  selected: boolean;
  onSelect: () => void;
}) {
  // controlled so the "it just unlocked" announcement can time out; hover still drives it after
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!tab.tooltipOpen) return;

    setOpen(true);
    const timer = setTimeout(() => setOpen(false), ANNOUNCE_MS);

    return () => clearTimeout(timer);
  }, [tab.tooltipOpen]);

  const button = (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      // aria-disabled rather than disabled: a disabled button swallows the hover the tooltip needs
      aria-disabled={tab.disabled}
      onClick={() => !tab.disabled && onSelect()}
      className={cn(
        "shrink-0 border-r border-white/10 px-3 py-2 font-mono text-xs whitespace-nowrap transition-colors",
        tab.disabled
          ? "cursor-not-allowed text-white/25"
          : selected
            ? "bg-accent/20 text-white"
            : "text-white/50 hover:text-white",
      )}
    >
      {tab.label}
    </button>
  );

  if (!tab.tooltip) return button;

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger render={button} />
      <TooltipContent side="bottom">{tab.tooltip}</TooltipContent>
    </Tooltip>
  );
}

function Suggestions({
  items,
  index,
  onPick,
}: {
  items: { label: string; detail?: string }[];
  index: number;
  onPick: (position: number) => void;
}) {
  return (
    <div role="listbox" aria-label="Field suggestions">
      {items.map((item, position) => (
        <button
          key={item.label}
          type="button"
          role="option"
          aria-selected={position === index}
          // the textarea must keep focus, so this fires on pointer-down instead of click
          onMouseDown={(event) => {
            event.preventDefault();
            onPick(position);
          }}
          className={cn(
            "flex w-full items-baseline gap-2 px-2 py-1 text-left font-mono text-xs",
            position === index ? "bg-primary/25" : "hover:bg-white/5",
          )}
        >
          <span className="text-primary-light">{item.label}</span>
          <span className="truncate text-white/40">{item.detail}</span>
        </button>
      ))}

      <div className="border-t border-white/10 px-2 py-1 font-mono text-[11px] text-white/35">
        <Kbd className="bg-white/10 text-white/70">⇥</Kbd> accept{" "}
        <Kbd className="ml-1 bg-white/10 text-white/70">↑↓</Kbd> move{" "}
        <Kbd className="ml-1 bg-white/10 text-white/70">esc</Kbd> dismiss
      </div>
    </div>
  );
}

/** the field whose key or value the caret is sitting in, for the helper text */
function fieldAtCaret(value: string, caret: number, fields: readonly FieldDoc[]) {
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
  const lineEnd = value.indexOf("\n", caret);
  const line = value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);
  const key = /"([^"\\]+)"\s*:/.exec(line)?.[1];
  if (!key) return undefined;

  const search = (list: readonly FieldDoc[]): FieldDoc | undefined => {
    for (const field of list) {
      if (field.key === key) return field;
      const child = field.children && search(field.children);
      if (child) return child;
    }
    return undefined;
  };

  return search(fields);
}

function Bubble({ issue, field }: { issue?: Diagnostic; field?: FieldDoc }) {
  if (!issue && !field) return null;

  return (
    <div
      className={issue ? "text-destructive-text" : "text-white/70"}
      role="status"
      aria-live="polite"
    >
      {issue ? (
        issue.message
      ) : (
        <>
          <span className="text-primary-light">{field?.key}</span>
          {!field?.required && "?"}: {field?.hint}
          {field?.values ? (
            <span className="mt-1 block text-white/40">{field.values.join(" | ")}</span>
          ) : null}
        </>
      )}
    </div>
  );
}
