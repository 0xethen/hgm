import { useMatches, type StaticDataRouteOption } from "@tanstack/react-router";
import { brand } from "./meta/brand";

type Matches = ReturnType<typeof useMatches>;
type Match = Matches[number];

type TitleData = Exclude<StaticDataRouteOption["title"], string | undefined>;

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

export function getDescription(matches: readonly Match[], fallback = ""): string {
  return findFromLeaf(matches, (match) => match.staticData.description) ?? fallback;
}
