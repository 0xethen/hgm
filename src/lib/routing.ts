import { useMatches, type AnyRoute, type AnyRouter } from "@tanstack/react-router";
import { brand } from "./meta/brand";

type Matches = ReturnType<typeof useMatches>;
type Match = Matches[number];

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
  | {
      label?: string | ((match: Match) => string | undefined);
      hidden?: boolean;
    };

export interface Crumb {
  label: string;
  pathname: string;
  routeId: string;
  linkable: boolean;
}

const deadEndRouteIds = new Set<string>();

function hasOwnPage(route: AnyRoute): boolean {
  const children: AnyRoute[] | undefined = route.children;
  if (!children?.length) return true;

  // "/" is the index route; a pathless layout shares the URL, so it can hold the index instead
  return children.some((child) =>
    child.path === "/" ? true : child.path === undefined ? hasOwnPage(child) : false,
  );
}

export function indexDeadEndRoutes(router: AnyRouter): void {
  deadEndRouteIds.clear();

  const walk = (route: AnyRoute) => {
    if (!hasOwnPage(route)) deadEndRouteIds.add(route.id);
    for (const child of (route.children ?? []) as AnyRoute[]) walk(child);
  };

  walk(router.routeTree);
}

// true when this route id has children but no index route, so its own URL renders nothing
export function isDeadEnd(routeId: string | undefined): boolean {
  return routeId !== undefined && deadEndRouteIds.has(routeId);
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
  if (isNotFound(matches)) return "Not Found";
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

// TODO: necessary to some() on each route change?
function isNotFound(matches: readonly Match[]): boolean {
  return matches.some((match) => match._notFound || match.status === "notFound");
}

export function showsChrome(matches: readonly Match[]): boolean {
  const last = matches.at(-1);
  if (!last) return false;

  return !last.staticData.header?.hidden && !isNotFound(matches) && !last.error;
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

    const crumb: Crumb = {
      label,
      pathname: match.pathname,
      routeId: match.routeId,
      linkable: !isDeadEnd(match.routeId),
    };

    const previous = crumbs.at(-1);
    if (previous?.pathname === crumb.pathname) crumbs[crumbs.length - 1] = crumb;
    else crumbs.push(crumb);
  }

  return crumbs;
}

/**
 * The container __root wraps every page in. A route sets it once and everything nested under it
 * inherits, so a section keeps one width and one set of gutters. `false` opts a full-bleed page
 * out of the wrapper entirely.
 */
export function getContainerClassName(matches: readonly Match[]): string | false | undefined {
  return findFromLeaf(matches, (match) => match.staticData.classNames?.container);
}

export function getDescription(matches: readonly Match[], fallback = ""): string {
  return findFromLeaf(matches, (match) => match.staticData.description) ?? fallback;
}
