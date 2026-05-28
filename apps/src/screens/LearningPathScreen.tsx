import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { MODULES } from "@mathning/shared";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppCard } from "../components/AppCard";
import { BottomNav } from "../components/BottomNav";
import { ScreenBackground } from "../components/ScreenBackground";
import { LessonIconCircle } from "../components/LessonIconCircle";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAppHeader } from "../hooks/useAppHeader";
import { isLessonUnlocked } from "../lib/progression";
import type { RootStackParamList } from "../navigation/types";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LearningPathScreen() {
  const navigation = useNavigation<Nav>();
  useAppHeader(navigation, "Trilha", { showProfileButton: false });
  const { colors, layout, cardShadow } = useTheme();
  const styles = useMemo(
    () => createLearningPathStyles(colors, cardShadow),
    [colors, cardShadow],
  );
  const { progress, loading } = useAuthContext();
  const completed = progress?.completedLessonIds ?? [];
  const practiced = progress?.practicedLessonIds ?? [];

  if (loading || !progress) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const activeModules = MODULES.filter((m) => m.available);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={layout.scroll}>
        <View style={styles.pageIntro}>
          <Text style={layout.pageTitle}>Trilha de aprendizado</Text>
          <Text style={layout.pageSub}>
            Avance em ordem: cada lição libera a próxima. Toque no assunto para a teoria ou use
            &quot;Pratique&quot; para exercícios.
          </Text>
        </View>

        {activeModules.map((mod, phaseIdx) => {
          const total = mod.lessons.length;
          const doneCount = mod.lessons.filter((l) => completed.includes(l.id)).length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

          return (
            <View key={mod.id}>
              <AppCard variant="accent" style={styles.phaseCard}>
                <View style={styles.phaseTop}>
                  <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeTxt}>{phaseIdx + 1}</Text>
                  </View>
                  <View style={styles.phaseHead}>
                    <Text style={styles.phaseLabel}>Fase {phaseIdx + 1}</Text>
                    <Text style={styles.phaseTitle}>{mod.title}</Text>
                    <Text style={styles.phaseDesc}>{mod.description}</Text>
                  </View>
                </View>
                <Text style={styles.progressMeta}>
                  {doneCount} de {total} concluídas · {pct}%
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </AppCard>

              {mod.lessons.map((lesson) => {
                const isDone = completed.includes(lesson.id);
                const hasPracticed = practiced.includes(lesson.id);
                const open = isLessonUnlocked(mod.id, lesson.id, completed);
                const goTheory = () =>
                  navigation.navigate("TheoryDetail", {
                    moduleId: mod.id,
                    lessonId: lesson.id,
                  });
                const goPractice = () =>
                  navigation.navigate("Exercise", {
                    moduleId: mod.id,
                    lessonId: lesson.id,
                  });

                return (
                  <View
                    key={lesson.id}
                    style={[
                      styles.lessonRow,
                      isDone && styles.lessonDone,
                      open && !isDone && styles.lessonOpen,
                      !open && styles.lessonLocked,
                    ]}
                  >
                    <Pressable
                      disabled={!open}
                      onPress={goTheory}
                      style={({ pressed }) => [
                        styles.lessonMain,
                        pressed && open && { opacity: 0.92 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Teoria: ${lesson.title}`}
                    >
                      <LessonIconCircle
                        lessonId={lesson.id}
                        operation={lesson.operation}
                        isDone={isDone}
                        open={open}
                        size={40}
                      />
                      <View style={styles.lessonTitleWrap}>
                        <Text
                          style={[styles.lessonTitle, !open && styles.lessonTitleOff]}
                          numberOfLines={2}
                        >
                          {lesson.title}
                        </Text>
                        {isDone && (
                          <View style={styles.completePill}>
                            <Text style={styles.completePillTxt}>Completo</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                    {open ? (
                      <Pressable
                        onPress={goPractice}
                        style={({ pressed }) => [
                          hasPracticed ? styles.pratiqueBtnAgain : styles.pratiqueBtn,
                          pressed && { opacity: 0.9 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={
                          hasPracticed
                            ? `Praticar novamente ${lesson.title}`
                            : `Praticar ${lesson.title}`
                        }
                      >
                        <Text
                          style={
                            hasPracticed ? styles.pratiqueBtnAgainTxt : styles.pratiqueBtnTxt
                          }
                        >
                          {hasPracticed ? "Praticar novamente" : "Pratique"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
      <BottomNav navigation={navigation} route="LearningPath" />
    </ScreenBackground>
  );
}

function createLearningPathStyles(
  colors: ColorTokens,
  cardShadow: ReturnType<typeof import("../theme/ui").createCardShadow>,
) {
  return StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageIntro: { marginBottom: 4 },
  phaseCard: { marginBottom: 8 },
  phaseTop: { flexDirection: "row", gap: 14 },
  phaseBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseBadgeTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },
  phaseHead: { flex: 1 },
  phaseLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  phaseDesc: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  progressMeta: {
    marginTop: 14,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.card,
    marginBottom: 8,
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...cardShadow,
  },
  lessonDone: {
    backgroundColor: colors.lessonDone,
    borderColor: "transparent",
  },
  lessonOpen: {
    backgroundColor: colors.lessonOpen,
    borderColor: "transparent",
  },
  lessonLocked: { opacity: 0.55 },
  lessonMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  lessonTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  lessonTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  lessonTitleOff: { color: colors.muted },
  pratiqueBtn: {
    flexShrink: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  pratiqueBtnTxt: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  pratiqueBtnAgain: {
    flexShrink: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pratiqueBtnAgainTxt: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  completePill: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completePillTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.successDark,
  },
  });
}
