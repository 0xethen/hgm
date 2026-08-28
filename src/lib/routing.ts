import { useMatches } from "@tanstack/react-router";
import { brand } from "./meta/brand";

type Matches = ReturnType<typeof useMatches>;
type Match = Matches[number];

// TODO: merge w Bogey 2 title system

/**
 * a string is the crumb's label
 * `false` drops this route from the trail (for an index route that shares its layout's URL)
 * `{ hidden: true }` suppresses the whole trail on any page under this route
 * `{ label }` may be a function, for crumbs named after a param or loaded document
 *
 * uses title by default. staticData.breadcrumb is used for overrides only
 */
export type BreadcrumbOption =
  | string
  | false
  | { label?: string | ((match: Match) => string | undefined); hidden?: boolean };

export interface Crumb {
  label: string;
  pathname: string;
}

// export interface BreadcrumbContext {
//   pathname: string;
//   params: Record<string, string>;
//   loaderData: unknown;
// }

export type TitleOption = string | { page: string; pending?: string; exact?: boolean };
type TitleData = Exclude<TitleOption, string | undefined>;

function getTitleData(match: Match): TitleData | undefined {
  const title = match.staticData.title;
  return typeof title === "string" ? { page: title } : title;
}

function getMatchTitle(match: Match): string | undefined {
  const title = getTitleData(match);

  if (match.isFetching && title?.pending) {
    return title.pending;
  }

  return title?.page;
}

function findFromLeaf<T>(
  matches: readonly Match[],
  select: (match: Match) => T | undefined,
): T | undefined {
  for (let index = matches.length - 1; index >= 0; index--) {
    const value = select(matches[index]);
    if (value !== undefined) return value;
  }

  return undefined;
}

export function getTitle(
  matches: readonly Match[],
  separator: string = " / ",
  prefix: string | readonly string[] = [],
  suffix: string = brand.name,
): string {
  const last = matches.at(-1);
  const fallback = `Page / ${suffix}`;

  if (!last) return "";
  if (last._notFound || last.status === "notFound") return "Not Found";
  if (last.error) return "An error occurred";
  if (getTitleData(last)?.exact) return getMatchTitle(last) ?? fallback;

  const prefixes = Array.isArray(prefix) ? prefix.join(separator) : [prefix];

  const titles =
    prefixes +
    matches
      .toReversed()
      .map(getMatchTitle)
      .filter((title): title is string => title !== undefined)
      .join(separator);

  return titles ? `${titles}${separator}${suffix}` : fallback;
}

export function showsChrome(matches: readonly Match[]): boolean {
  const last = matches.at(-1);
  if (!last) return false;

  return !last.staticData.header?.hidden && !last._notFound && !last.error;
}

export function getBreadcrumbs(matches: readonly Match[]): Crumb[] {
  if (!showsChrome(matches)) return [];

  const crumbs: Crumb[] = [];

  for (const match of matches) {
    const option = match.staticData.breadcrumb;

    // any route in the chain can suppress the trail for everything beneath it
    if (option !== null && typeof option === "object" && option.hidden) return [];
    if (option === false) continue;

    const label =
      typeof option === "string"
        ? option
        : typeof option?.label === "function"
          ? option.label(match)
          : (option?.label ?? getMatchTitle(match));

    if (!label) continue;

    // a layout route and its index route resolve to the same URL; keep the deeper label
    const previous = crumbs.at(-1);
    if (previous?.pathname === match.pathname) previous.label = label;
    else crumbs.push({ label, pathname: match.pathname });
  }

  return crumbs;
}

export function getDescription(matches: readonly Match[], fallback = ""): string {
  return findFromLeaf(matches, (match) => match.staticData.description) ?? fallback;
}
