import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export async function triggerPracticeFeedback(correct: boolean): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  } catch {
    // Dispositivo sem suporte a haptics
  }
}
