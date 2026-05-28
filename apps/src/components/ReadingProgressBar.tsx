import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { fontFamilies } from "../theme/typography";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type ReadingProgressBarProps = {
  percent: number;
};

export function ReadingProgressBar({ percent }: ReadingProgressBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={`Leitura ${clamped}%`}
      accessibilityValue={{ min: 0, max: 100, now: clamped, text: `${clamped}%` }}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>Progresso de leitura</Text>
        <Text style={styles.pct}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 14,
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: radius.sm,
      backgroundColor: colors.cardMuted,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    label: {
      fontFamily: fontFamilies.semiBold,
      fontSize: 12,
      color: colors.muted,
    },
    pct: {
      fontFamily: fontFamilies.bold,
      fontSize: 12,
      color: colors.primary,
    },
    track: {
      height: 5,
      borderRadius: radius.pill,
      backgroundColor: colors.border,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
    },
  });
}
