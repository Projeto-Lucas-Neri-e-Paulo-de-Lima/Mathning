import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { RootStackParamList } from "../navigation/types";
import { fontFamilies } from "../theme/typography";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type LessonFlowMode = "theory" | "practice";

type LessonFlowBarProps = {
  navigation: Nav;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  mode: LessonFlowMode;
};

export function LessonFlowBar({
  navigation,
  moduleId,
  lessonId,
  lessonTitle,
  mode,
}: LessonFlowBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = { moduleId, lessonId };

  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      <View style={styles.titleRow}>
        <Ionicons name="layers-outline" size={16} color={colors.primary} />
        <Text style={styles.title} numberOfLines={1}>
          {lessonTitle}
        </Text>
      </View>
      <View style={styles.segments}>
        <Pressable
          style={[styles.seg, mode === "theory" && styles.segActive]}
          onPress={() => {
            if (mode !== "theory") {
              navigation.replace("TheoryDetail", params);
            }
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "theory" }}
          accessibilityLabel="Teoria"
        >
          <Ionicons
            name="book-outline"
            size={14}
            color={mode === "theory" ? colors.primaryText : colors.muted}
          />
          <Text style={[styles.segTxt, mode === "theory" && styles.segTxtActive]}>
            Teoria
          </Text>
        </Pressable>
        <Pressable
          style={[styles.seg, mode === "practice" && styles.segActive]}
          onPress={() => {
            if (mode !== "practice") {
              navigation.replace("Exercise", params);
            }
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "practice" }}
          accessibilityLabel="Prática"
        >
          <Ionicons
            name="barbell-outline"
            size={14}
            color={mode === "practice" ? colors.primaryText : colors.muted}
          />
          <Text style={[styles.segTxt, mode === "practice" && styles.segTxtActive]}>
            Prática
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: {
      gap: 10,
      marginBottom: 14,
      padding: 12,
      borderRadius: radius.card,
      backgroundColor: colors.cardMuted,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      flex: 1,
      fontFamily: fontFamilies.bold,
      fontSize: 15,
      color: colors.text,
    },
    segments: {
      flexDirection: "row",
      gap: 8,
    },
    seg: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    segActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    segTxt: {
      fontFamily: fontFamilies.semiBold,
      fontSize: 13,
      color: colors.muted,
    },
    segTxtActive: {
      color: colors.primaryText,
    },
  });
}
