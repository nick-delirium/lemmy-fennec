import { useSafeAreaInsets } from "react-native-safe-area-context";

import useKeyboard from "./useKeyboard";

/**
 * Bottom padding needed to clear the home indicator.
 *
 * Returns 0 while the keyboard is up: the keyboard already covers that strip, so
 * reserving it as well leaves a visible gap between the input row and the
 * keyboard. For screens whose bottom-most child is a fixed input or button row.
 */
export default function useBottomInset() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboard();
  return keyboardHeight > 0 ? 0 : insets.bottom;
}
