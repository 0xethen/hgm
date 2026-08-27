import { clsx, type ClassValue } from "cnfast";
import { twMerge } from "cnfast";
import { brand } from "./meta/brand";

export class EDATestingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EDATestingError";
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getAsset(path: string) {
  const base = import.meta.env.BASE_URL || "/";

  if (base === "/" || !path.startsWith("/")) return path;
  return import.meta.env.BASE_URL + path;
}

declare global {
  interface String {
    toAsset(): string;
    slugify(preserveCase?: boolean): string;
    initials(): string;
    plural(count: number, ending?: string): string;
  }
}

String.prototype.toAsset = function () {
  return getAsset(this.toString());
};

String.prototype.slugify = function (preserveCase = false) {
  let str = this.toString()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^#/, "");

  return preserveCase ? str : str.toLowerCase();
};

String.prototype.initials = function () {
  return this.toString()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

String.prototype.plural = function (count, ending = "s") {
  const str = String(this);

  if (count === 1) return str;

  if (ending) return str + ending;

  const lower = str.toLowerCase();
  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) {
    return str.slice(0, -1) + "ies";
  }

  if (/(s|x|z|ch|sh)$/.test(lower)) {
    return str + "es";
  }

  return str + "s";
};

export function cap(num: number, cap: number, suffix?: string): string {
  return num > cap ? `${cap}${suffix}` : String(num);
}

export function buildUrl(path: string): string {
  return `${window.location.protocol || "https:"}//${window.location.host || brand.domain}${path}`;
}

const GW_EMAIL_DOMAIN = "gwinnett.k12.ga.us";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGWEmailUrl(data: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}): string {
  const { to, cc, bcc, subject, body } = data;

  const baseUrl = `https://mail.google.com/a/${GW_EMAIL_DOMAIN}/mail/`;
  const params: URLSearchParams = new URLSearchParams();

  // i am a chud and this is my program
  // for (let i = 0; i < Object.keys(data).length; i++) {
  //   params.set(Object.keys(data)[i], Object.values(data)[i]);
  // }

  // keep it simple, ocean man
  params.set("view", "cm");
  if (to) params.set("to", to);
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);

  return `${baseUrl}?${params.toString()}`;
}

export function copy(text: string, silent = true) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    console.error("Clipboard API unsupported!");
    if (!silent) alert("we couldn't detect a clipboard on your device");
  }

  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed to copy text: ", err);
    if (!silent) alert("your device can't copy this to the clipboard: " + text);
  });
}

export function popup(url: string, target: string, w: number, h: number, features?: string) {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  const left = width / 2 - w / 2 + dualScreenLeft;
  const top = height / 2 - h / 2 + dualScreenTop;

  const newWindow = window.open(
    url,
    target,
    (features || "scrollbars=yes") + `, width=${w}, height=${h}, top=${top}, left=${left}`,
  );

  // Puts focus on the newWindow
  if (newWindow && newWindow.focus) {
    newWindow.focus();
  }
}
