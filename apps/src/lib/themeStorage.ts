import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeMode } from "../theme/tokens";

const KEY_MODE = "@mathning/theme_mode";

export async function loadStoredThemeMode(): Promise<ThemeMode | null> {
  try {
    const mode = await AsyncStorage.getItem(KEY_MODE);
    if (mode === "light" || mode === "dark" || mode === "system") {
      return mode;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(KEY_MODE, mode);
}
