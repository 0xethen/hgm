const GOATCOUNTER_URL = import.meta.env.PUBLIC_GOATCOUNTER_URL as string | undefined;

// keepalive
export function trackEvent(name: string, props?: Record<string, string>): void {
  if (!GOATCOUNTER_URL || typeof window === "undefined") return;

  const path = props ? `${name}?${new URLSearchParams(props).toString()}` : name;

  const url = new URL(GOATCOUNTER_URL);
  url.searchParams.set("p", path);
  url.searchParams.set("t", document.title);
  url.searchParams.set("r", document.referrer);
  url.searchParams.set("e", "true"); // an event, not a real pageview

  void fetch(url.toString(), { mode: "no-cors", keepalive: true }).catch(() => {});
}
