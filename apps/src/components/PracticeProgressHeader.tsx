import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { fontFamilies } from "../theme/typography";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type PracticeProgressHeaderProps = {
  questionNum: number;
  total: number;
};

export function PracticeProgressHeader({
  questionNum,
  total,
}: PracticeProgressHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const progressPct = Math.round((questionNum / total) * 100);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={`Questão ${questionNum} de ${total}`}
      accessibilityValue={{
        min: 0,
        max: total,
        now: questionNum,
        text: `${progressPct} por cento da sessão`,
      }}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Questão {questionNum} de {total}
        </Text>
        <Text style={styles.pct}>{progressPct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: 10,
      gap: 8,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      fontFamily: fontFamilies.semiBold,
      fontSize: 13,
      color: colors.primary,
    },
    pct: {
      fontFamily: fontFamilies.bold,
      fontSize: 12,
      color: colors.muted,
    },
    track: {
      height: 6,
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
