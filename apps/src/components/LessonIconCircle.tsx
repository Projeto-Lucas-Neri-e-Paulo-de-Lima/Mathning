import { Ionicons } from "@expo/vector-icons";
import type { Operation } from "@mathning/shared";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getLessonIconState } from "../constants/lessonIcons";

export function LessonIconCircle({
  lessonId,
  operation,
  isDone,
  open,
  size = 40,
  style,
}: {
  lessonId: string;
  operation: Operation;
  isDone: boolean;
  open: boolean;
  size?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const state = getLessonIconState(lessonId, operation, { isDone, open }, colors);
  const iconSize = Math.round(size * 0.5);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: state.backgroundColor,
        },
        style,
      ]}
    >
      <Ionicons name={state.icon} size={iconSize} color={state.iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
