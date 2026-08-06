const recentDateOptions = {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
} as const;
const oldDateOptions = {
  month: "long",
  day: "2-digit",
  year: "numeric",
} as const;

let localeResolved = false;
let cachedLocale: string | undefined;

/**
 * Device locale for date formatting.
 *
 * This used to read `NativeModules.SettingsManager.settings` on iOS, but that is
 * a legacy bridge module which no longer exists under the new architecture — and
 * because it ran at import time, it took the whole app down on launch. Intl is
 * built into Hermes on both platforms and needs no native module. Resolved lazily
 * and cached; `undefined` just means "let the runtime pick", which is the same
 * default `toLocaleDateString` would apply anyway.
 */
function deviceLocale(): string | undefined {
  if (!localeResolved) {
    localeResolved = true;
    try {
      cachedLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    } catch {
      cachedLocale = undefined;
    }
  }
  return cachedLocale;
}

export const makeDateString = (timestamp: number | string) => {
  const dateObj = new Date(timestamp);
  const isSameYear = dateObj.getFullYear() === new Date().getFullYear();

  return dateObj.toLocaleDateString(
    deviceLocale(),
    isSameYear ? recentDateOptions : oldDateOptions,
  );
};

export const shortenNumbers = (num: number) => {
  if (num < 1000) return num;
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

export function debounce(func: any, delay: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
