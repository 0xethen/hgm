import { Button } from "#/components/ui/button";
import { ExtLink, Link } from "#/components/ui/ethendotapp/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import {
  RiAppleFill,
  RiGoogleFill,
  RiMapPinLine,
  RiMicrosoftFill,
  RiTimeLine,
} from "@remixicon/react";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "#/components/ui/context-menu";

import type { HGEvent } from "#/lib/meta/events";
import { useHydrated } from "@tanstack/react-router";
import { copy } from "#/lib/utils";

export function ProgramsEventPage({
  event,
  content,
  additions,
}: {
  event: HGEvent;
  content?: React.ReactNode;
  additions?: {
    left?: { start?: React.ReactNode; end?: React.ReactNode };
    right?: { start?: React.ReactNode; end?: React.ReactNode };
  };
}) {
  const hydrated = useHydrated();

  const escapeICS = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const formatICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const getCalendarLink = (event: HGEvent, type: "apple" | "google" | "outlook") => {
    const buildICS = () => {
      const uid =
        `${event.shortName || event.name}-${event.startDate.toISOString()}@events.hackgwinnett.org`.replace(
          /\s+/g,
          "-",
        );

      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//HackGwinnett//Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(event.startDate)}`,
        `DTEND:${formatICSDate(event.endDate)}`,
        `SUMMARY:${escapeICS(event.name)}`,
        `DESCRIPTION:${escapeICS(event.description)}`,
        `LOCATION:${escapeICS(`${event.location.name}, ${event.location.address}`)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
    };

    if (type === "google") {
      const start = event.startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const end = event.endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const details = encodeURIComponent(event.description);
      const location = encodeURIComponent(`${event.location.name}, ${event.location.address}`);
      const text = encodeURIComponent(event.name);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
    }

    if (type === "outlook") {
      const start = encodeURIComponent(event.startDate.toISOString());
      const end = encodeURIComponent(event.endDate.toISOString());
      const subject = encodeURIComponent(event.name);
      const body = encodeURIComponent(event.description);
      const location = encodeURIComponent(`${event.location.name}, ${event.location.address}`);

      return `https://outlook.cloud.microsoft/calendar/0/deeplink/compose?subject=${subject}&body=${body}&startdt=${start}&enddt=${end}&location=${location}`;
    }

    const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
    return URL.createObjectURL(blob);
  };

  const addToCalendar = (event: HGEvent, type: "apple" | "google" | "outlook") => {
    if (!hydrated) return;

    const url = getCalendarLink(event, type);
    const filename = `${event.shortName || event.name}.ics`;

    if (type === "apple") {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 500);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyToCalendar = (event: HGEvent, type: "apple" | "google" | "outlook") => {
    if (!hydrated) return;

    const url = getCalendarLink(event, type);
    copy(url);
  };

  return (
    <div className="p-6 md:p-9 mx-auto max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="font-semibold text-4xl">{event.name}</h1>
            <p>{event.description}</p>
          </div>
          {event.registration?.closed ? (
            <Alert>
              <AlertTitle>Registrations closed</AlertTitle>
              <AlertDescription>
                Sign-ups for {event.name} are closed at this time.
              </AlertDescription>
            </Alert>
          ) : event.registration ? (
            <Button
              variant="secondary"
              size="lg"
              render={<Link to={event.registration.url} buttonStyle />}
            >
              Register Now
            </Button>
          ) : null}
          <ItemGroup>
            <Item variant="muted">
              <ItemMedia variant="icon">
                <RiMapPinLine />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{event.location.name}</ItemTitle>
                <ItemDescription className="text-xs">
                  <ExtLink href={event.location.mapUrl}>{event.location.address}</ExtLink>
                </ItemDescription>
              </ItemContent>
            </Item>
            <Item variant="muted">
              <ItemMedia variant="icon">
                <RiTimeLine />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {event.startDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </ItemTitle>
                <ItemDescription className="text-xs">
                  <Popover>
                    <PopoverTrigger className="alt-link">Add to calendar</PopoverTrigger>
                    <PopoverContent>
                      <ContextMenu>
                        <ContextMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => addToCalendar(event, "apple")}
                            />
                          }
                        >
                          <RiAppleFill /> Apple
                          <span className="sr-only">Apple Calendar</span>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuGroup>
                            <ContextMenuItem
                              onSelect={() => copyToCalendar(event, "apple")}
                              disabled
                            >
                              Copy link
                            </ContextMenuItem>
                          </ContextMenuGroup>
                        </ContextMenuContent>
                      </ContextMenu>

                      <ContextMenu>
                        <ContextMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => addToCalendar(event, "google")}
                            />
                          }
                        >
                          <RiGoogleFill /> Google
                          <span className="sr-only">Google Calendar</span>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuGroup>
                            <ContextMenuItem onSelect={() => copyToCalendar(event, "google")}>
                              Copy link
                            </ContextMenuItem>
                          </ContextMenuGroup>
                        </ContextMenuContent>
                      </ContextMenu>

                      <ContextMenu>
                        <ContextMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => addToCalendar(event, "outlook")}
                            />
                          }
                        >
                          <RiMicrosoftFill /> Outlook
                          <span className="sr-only">Microsoft Outlook</span>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuGroup>
                            <ContextMenuItem onSelect={() => copyToCalendar(event, "outlook")}>
                              Copy link
                            </ContextMenuItem>
                          </ContextMenuGroup>
                        </ContextMenuContent>
                      </ContextMenu>
                    </PopoverContent>
                  </Popover>
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
          <div className="flex flex-col gap-2">
            {additions?.left?.start}
            {content}
            {/*{event.details?.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}*/}
            {additions?.left?.end}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center lg:items-end">
          {additions?.right?.start}
          {/* TODO: image carousel here(?) yay HG!!! */}
          {additions?.right?.end}
        </div>
      </div>
    </div>
  );
}
