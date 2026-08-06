import { Platform, ToastAndroid } from "react-native";

import { toastStore } from "../store/toastStore";

/**
 * ToastAndroid only exists on Android and throws when called on iOS, so every
 * toast goes through here: native on Android, the <Toast /> overlay elsewhere.
 */
export function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  } else {
    toastStore.show(message);
  }
}
