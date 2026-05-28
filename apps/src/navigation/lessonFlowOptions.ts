import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/** Transição horizontal consistente entre teoria e prática do mesmo assunto. */
export const lessonFlowScreenOptions: NativeStackNavigationOptions = {
  animation: "slide_from_right",
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};
