import { NativeModules, Platform } from 'react-native';

const recentDateOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } as const;
const oldDateOptions = { month: 'long', day: '2-digit', year: 'numeric' } as const;

const deviceLanguage =
  Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13 is special
  : NativeModules.I18nManager.localeIdentifier;

export const makeDateString = (timestamp: number | string) => {
  const dateObj = new Date(timestamp);
  const isSameYear = dateObj.getFullYear() === new Date().getFullYear();

  return dateObj.toLocaleDateString(
    deviceLanguage.replace('_', '-'), isSameYear ? recentDateOptions : oldDateOptions);
}