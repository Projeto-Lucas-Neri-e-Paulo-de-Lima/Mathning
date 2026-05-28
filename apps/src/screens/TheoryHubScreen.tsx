import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { MODULES } from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppCard } from "../components/AppCard";
import { HubListSkeleton } from "../components/skeleton/HubListSkeleton";
import { BottomNav } from "../components/BottomNav";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { LessonIconCircle } from "../components/LessonIconCircle";
import { ScreenBackground } from "../components/ScreenBackground";
import { getLessonTopicVisual } from "../constants/lessonIcons";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAppHeader } from "../hooks/useAppHeader";
import { isLessonUnlocked } from "../lib/progression";
import type { RootStackParamList } from "../navigation/types";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";
import type { ThemeLayout } from "../theme/ui";
import { fontFamilies } from "../theme/typography";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Tela principal de Teoria (mesmo nível da Trilha): lista fases e assuntos para ler antes de praticar.
 */
export function TheoryHubScreen() {
  const navigation = useNavigation<Nav>();
  useAppHeader(navigation);
  const { colors, layout } = useTheme();
  const styles = useMemo(
    () => createTheoryHubStyles(colors, layout),
    [colors, layout],
  );
  const { progress, loading } = useAuthContext();
  const completed = progress?.completedLessonIds ?? [];

  if (loading || !progress) {
    return (
      <>
        <HubListSkeleton />
        <BottomNav navigation={navigation} route="Teoria" />
      </>
    );
  }

  const activeModules = MODULES.filter((m) => m.available);

  const topicCount = activeModules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <ScreenBackground>
      <ScreenScrollView withBottomNav>
        <View style={styles.heroBanner}>
          <View style={[layout.heroBlob, { top: -24, right: -16 }]} />
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="library" size={24} color={colors.textOnPrimary} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Biblioteca de Teoria</Text>
              <Text style={styles.heroSub}>
                Estude primeiro, pratique depois — conceitos com exemplos visuais.
              </Text>
            </View>
          </View>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaPill}>
              <Ionicons name="book-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.heroMetaTxt}>{topicCount} assuntos</Text>
            </View>
            <View style={styles.heroMetaPill}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.heroMetaTxt}>{completed.length} concluídos</Text>
            </View>
          </View>
        </View>

        {activeModules.map((mod, phaseIdx) => {
          return (
            <View key={mod.id} style={styles.moduleSection}>
              <View style={styles.moduleHead}>
                <View style={styles.moduleHeadLeft}>
                  <View style={styles.moduleBadge}>
                    <Text style={styles.moduleBadgeTxt}>{phaseIdx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleLabel}>Fase {phaseIdx + 1}</Text>
                    <Text style={styles.moduleTitle}>{mod.title}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.moduleDesc}>{mod.description}</Text>

              {mod.lessons.map((lesson) => {
                const isDone = completed.includes(lesson.id);
                const open = isLessonUnlocked(mod.id, lesson.id, completed);
                const topicVisual = getLessonTopicVisual(lesson.id, lesson.operation);
                const goTheoryDetail = () =>
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
                  <AppCard
                    key={lesson.id}
                    style={[styles.topicCard, !open ? styles.topicCardLocked : undefined]}
                  >
                    <View style={styles.topicTop}>
                      <LessonIconCircle
                        lessonId={lesson.id}
                        operation={lesson.operation}
                        isDone={isDone}
                        open={open}
                        size={38}
                      />
                      <View style={styles.topicMain}>
                        <View style={styles.topicTitleRow}>
                          <Text style={[styles.topicTitle, !open && styles.topicTitleOff]}>
                            {lesson.title}
                          </Text>
                          {topicVisual.tag ? (
                            <View
                              style={[
                                styles.operationPill,
                                { backgroundColor: `${topicVisual.color}1A` },
                              ]}
                            >
                              <Text
                                style={[styles.operationPillTxt, { color: topicVisual.color }]}
                              >
                                {topicVisual.tag}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.topicSummary, !open && styles.topicSummaryOff]}>
                          {lesson.summary}
                        </Text>
                        <View style={styles.topicFoot}>
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={colors.muted} />
                            <Text style={styles.metaTxt}>Leitura rápida</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="eye-outline" size={14} color={colors.muted} />
                            <Text style={styles.metaTxt}>Exemplos visuais</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.topicActions}>
                      <Pressable
                        disabled={!open}
                        onPress={goTheoryDetail}
                        style={({ pressed }) => [
                          styles.readBtn,
                          pressed && open && { opacity: 0.9 },
                          !open && styles.readBtnDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Ler teoria: ${lesson.title}`}
                      >
                        <Ionicons
                          name={open ? "book-outline" : "lock-closed-outline"}
                          size={16}
                          color={open ? colors.primary : colors.locked}
                        />
                        <Text style={[styles.readBtnTxt, !open && styles.readBtnTxtOff]}>
                          {open ? "Ler teoria" : "Bloqueado"}
                        </Text>
                      </Pressable>
                      {open ? (
                        <Pressable
                          onPress={goPractice}
                          style={({ pressed }) => [
                            styles.practiceBtn,
                            pressed && { opacity: 0.9 },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Praticar ${lesson.title}`}
                        >
                          <Text style={styles.practiceBtnTxt}>Praticar</Text>
                        </Pressable>
                      ) : null}
                      {isDone ? (
                        <View style={styles.donePill}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.successDark} />
                          <Text style={styles.donePillTxt}>Concluído</Text>
                        </View>
                      ) : null}
                    </View>
                  </AppCard>
                );
              })}
            </View>
          );
        })}
      </ScreenScrollView>
      <BottomNav navigation={navigation} route="Teoria" />
    </ScreenBackground>
  );
}

function createTheoryHubStyles(colors: ColorTokens, layout: ThemeLayout) {
  return StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroBanner: {
    ...layout.heroBanner,
    marginBottom: 4,
  },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, zIndex: 1 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 22,
    color: colors.textOnPrimary,
    marginBottom: 4,
  },
  heroSub: {
    fontFamily: fontFamilies.regular,
    color: colors.mutedOnPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  heroMetaRow: { marginTop: 14, flexDirection: "row", gap: 8, flexWrap: "wrap", zIndex: 1 },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroMetaTxt: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.textOnPrimary,
  },
  moduleSection: { gap: 10 },
  moduleHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  moduleHeadLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  moduleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleBadgeTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  moduleLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  moduleTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },
  moduleDesc: { color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: 2 },
  topicCard: { gap: 12, padding: 14 },
  topicCardLocked: { opacity: 0.6 },
  topicTop: { flexDirection: "row", gap: 12, marginBottom: 4 },
  topicMain: { flex: 1, gap: 6 },
  topicTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  topicTitle: { fontSize: 17, fontWeight: "800", color: colors.text, flex: 1 },
  topicTitleOff: { color: colors.muted },
  operationPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  operationPillTxt: { fontSize: 11, fontWeight: "700" },
  topicSummary: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
  },
  topicSummaryOff: { color: colors.muted },
  topicFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaTxt: { fontSize: 12, color: colors.muted },
  topicActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardMuted,
  },
  readBtnDisabled: { backgroundColor: colors.bgSoft, borderColor: colors.border },
  readBtnTxt: { color: colors.primaryText, fontSize: 13, fontWeight: "700" },
  readBtnTxtOff: { color: colors.locked },
  practiceBtn: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  practiceBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  donePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  donePillTxt: {
    color: colors.successDark,
    fontSize: 12,
    fontWeight: "700",
  },
  });
}
