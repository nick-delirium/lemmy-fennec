import { NativeModules, Platform } from "react-native";

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

const deviceLanguage =
  Platform.OS === "ios"
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13 is special
    : NativeModules.I18nManager.localeIdentifier;

export const makeDateString = (timestamp: number | string) => {
  const dateObj = new Date(timestamp);
  const isSameYear = dateObj.getFullYear() === new Date().getFullYear();

  return dateObj.toLocaleDateString(
    deviceLanguage.replace("_", "-"),
    isSameYear ? recentDateOptions : oldDateOptions
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
