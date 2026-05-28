import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function skipHaptics(): boolean {
  return Platform.OS === "web";
}

export async function triggerSuccess(): Promise<void> {
  if (skipHaptics()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // sem suporte
  }
}

export async function triggerError(): Promise<void> {
  if (skipHaptics()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // sem suporte
  }
}

export async function triggerSelection(): Promise<void> {
  if (skipHaptics()) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // sem suporte
  }
}

export async function triggerLightImpact(): Promise<void> {
  if (skipHaptics()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // sem suporte
  }
}

/** Resposta certa ou errada na prática. */
export async function triggerPracticeFeedback(correct: boolean): Promise<void> {
  if (correct) {
    await triggerSuccess();
  } else {
    await triggerError();
  }
}
