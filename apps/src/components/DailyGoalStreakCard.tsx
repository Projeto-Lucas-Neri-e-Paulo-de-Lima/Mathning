import { DAILY_GOAL_EXERCISES } from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "./AppCard";
import { ProgressRing } from "./ProgressRing";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type DailyGoalStreakCardProps = {
  daily: number;
  goal?: number;
  streak: number;
  /** Exibe bloco de sequência à direita (Início). */
  showStreak?: boolean;
};

export function DailyGoalStreakCard({
  daily,
  goal = DAILY_GOAL_EXERCISES,
  streak,
  showStreak = true,
}: DailyGoalStreakCardProps) {
  const { colors, layout } = useTheme();
  const styles = createStyles(colors);
  const dailyPct = Math.min(100, Math.round((daily / goal) * 100));
  const goalMet = daily >= goal;
  const remaining = Math.max(0, goal - daily);
  const ringColor = goalMet ? colors.success : colors.primary;

  return (
    <AppCard variant="tint" style={styles.card}>
      <View style={styles.topRow}>
        <Text style={layout.sectionEyebrow}>Meta de hoje</Text>
        {showStreak ? <StreakBadge streak={streak} colors={colors} /> : null}
      </View>

      <View style={styles.mainRow}>
        <ProgressRing
          size={96}
          progress={dailyPct}
          color={ringColor}
          trackColor={colors.border}
          strokeWidth={9}
        >
          {goalMet ? (
            <Ionicons name="checkmark" size={36} color={colors.success} />
          ) : (
            <View style={styles.ringCenter}>
              <Text style={styles.ringCount}>
                {daily}/{goal}
              </Text>
            </View>
          )}
        </ProgressRing>

        <View style={styles.copy}>
          <Text style={styles.copyTitle}>
            {goalMet ? "Meta concluída!" : `${daily} de ${goal} exercícios`}
          </Text>
          <Text style={styles.copySub}>
            {goalMet
              ? "Você bateu a meta de hoje. Ótimo trabalho!"
              : remaining === 1
                ? "Falta 1 exercício para fechar a meta."
                : `Faltam ${remaining} exercícios para fechar a meta.`}
          </Text>
          <ExerciseDots daily={daily} goal={goal} colors={colors} />
        </View>
      </View>

      {goalMet ? (
        <View style={styles.celebration}>
          <Ionicons name="sparkles" size={18} color={colors.success} />
          <Text style={styles.celebrationTxt}>Parabéns! Meta de hoje concluída!</Text>
        </View>
      ) : null}
    </AppCard>
  );
}

function StreakBadge({
  streak,
  colors,
}: {
  streak: number;
  colors: ColorTokens;
}) {
  const active = streak > 0;
  return (
    <View
      style={[
        streakStyles.badge,
        {
          backgroundColor: active ? colors.streakBg : colors.cardMuted,
          borderColor: active ? colors.streak : colors.border,
        },
      ]}
    >
      <Ionicons
        name="flame"
        size={16}
        color={active ? colors.streak : colors.muted}
      />
      <Text
        style={[
          streakStyles.txt,
          { color: active ? colors.streak : colors.muted },
        ]}
      >
        {streak} {streak === 1 ? "dia" : "dias"}
      </Text>
    </View>
  );
}

function ExerciseDots({
  daily,
  goal,
  colors,
}: {
  daily: number;
  goal: number;
  colors: ColorTokens;
}) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: goal }, (_, i) => {
        const done = i < daily;
        return (
          <View
            key={i}
            style={[
              dotStyles.dot,
              {
                backgroundColor: done ? colors.success : colors.border,
                borderColor: done ? colors.success : colors.cardBorder,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    card: { gap: 14 },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    mainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
    },
    ringCenter: { alignItems: "center" },
    ringCount: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },
    copy: { flex: 1, minWidth: 0, gap: 6 },
    copyTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
    },
    copySub: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 18,
    },
    celebration: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: radius.sm,
      backgroundColor: colors.successBg,
      borderWidth: 1,
      borderColor: colors.success,
    },
    celebrationTxt: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: colors.successDark,
    },
  });
}

const streakStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  txt: { fontSize: 12, fontWeight: "800" },
});

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
});
