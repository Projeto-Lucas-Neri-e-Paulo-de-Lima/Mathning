import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { MODULES } from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomNav } from "../components/BottomNav";
import { useAuthContext } from "../context/AuthContext";
import { useAppHeader } from "../hooks/useAppHeader";
import { isLessonUnlocked } from "../lib/progression";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme/colors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: { elevation: 3 },
  default: {},
});

export function LearningPathScreen() {
  const navigation = useNavigation<Nav>();
  useAppHeader(navigation, "Trilha", { showProfileButton: false });
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
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Trilha de aprendizado</Text>
        <Text style={styles.sub}>
          Avance em ordem: cada lição libera a próxima. Toque no assunto para a teoria ou use
          &quot;Pratique&quot; para exercícios — a aba Teoria reúne todos os textos para leitura.
        </Text>

        {activeModules.map((mod, phaseIdx) => {
          const total = mod.lessons.length;
          const doneCount = mod.lessons.filter((l) => completed.includes(l.id)).length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

          return (
            <View key={mod.id}>
              <View style={[styles.phaseCard, cardShadow]}>
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
              </View>

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
                      <View
                        style={[
                          styles.lessonIconCircle,
                          isDone && styles.lessonIconDone,
                          open && !isDone && styles.lessonIconOpen,
                          !open && styles.lessonIconLocked,
                        ]}
                      >
                        <Ionicons
                          name={
                            isDone ? "checkmark" : open ? "book-outline" : "lock-closed"
                          }
                          size={20}
                          color={
                            isDone
                              ? "#fff"
                              : open
                                ? colors.primary
                                : colors.locked
                          }
                        />
                      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 36, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  h1: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  sub: { color: colors.muted, fontSize: 14, marginBottom: 8, lineHeight: 20 },
  phaseCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 8,
  },
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
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
  lessonIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonIconDone: { backgroundColor: colors.success },
  lessonIconOpen: { backgroundColor: "#E9E4FF" },
  lessonIconLocked: { backgroundColor: "#E5E7EB" },
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
