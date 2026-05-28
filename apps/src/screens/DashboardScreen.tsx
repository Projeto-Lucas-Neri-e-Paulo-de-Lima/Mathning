import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  getLesson,
  getModuleById,
  xpToNextLevel,
} from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { DailyGoalStreakCard } from "../components/DailyGoalStreakCard";
import { SuccessRateLineChart } from "../components/charts/SuccessRateLineChart";
import { ChartEmptyPlaceholder } from "../components/charts/ChartEmptyPlaceholder";
import { WeeklyXpChart } from "../components/charts/WeeklyXpChart";
import { BottomNav } from "../components/BottomNav";
import { LessonIconCircle } from "../components/LessonIconCircle";
import { EmptyState } from "../components/EmptyState";
import { DashboardSkeleton } from "../components/skeleton/DashboardSkeleton";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ScreenBackground } from "../components/ScreenBackground";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { triggerError } from "../lib/appHaptics";
import { useAppHeader } from "../hooks/useAppHeader";
import { useBottomNavInset } from "../hooks/useBottomNavInset";
import type { RootStackParamList } from "../navigation/types";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";
import type { ThemeLayout } from "../theme/ui";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function weekBarsFromProgress(totalXp: number, lastActiveDate: string): number[] {
  const days = [0, 0, 0, 0, 0, 0, 0];
  let idx = 0;
  if (lastActiveDate) {
    const d = new Date(`${lastActiveDate}T12:00:00`);
    const w = d.getDay();
    idx = w === 0 ? 6 : w - 1;
  } else {
    const w = new Date().getDay();
    idx = w === 0 ? 6 : w - 1;
  }
  days[idx] = Math.min(80, Math.max(0, totalXp));
  return days;
}

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const bottomNavInset = useBottomNavInset();
  const { colors, layout, cardShadow } = useTheme();
  const {
    progress,
    loading,
    error,
    demo,
    displayName,
    avatarId,
    signOutUser,
    refreshProgress,
  } = useAuthContext();
  const headerVariant =
    !loading && !error && progress ? ("hero" as const) : ("default" as const);
  useAppHeader(navigation, { variant: headerVariant });
  const styles = useMemo(
    () => createDashboardStyles(colors, layout, insets.top, bottomNavInset),
    [colors, layout, insets.top, bottomNavInset],
  );
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  async function handlePullRefresh() {
    setRefreshing(true);
    try {
      const ok = await refreshProgress();
      if (!ok) {
        void triggerError();
        showToast({
          message: "Não foi possível atualizar. Verifique sua conexão.",
          variant: "error",
        });
      }
    } finally {
      setRefreshing(false);
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Erro ao carregar progresso"
          message={error}
          actionLabel="Voltar ao login"
          onAction={() => void signOutUser()}
          actionVariant="secondary"
        />
      </View>
    );
  }

  if (loading || !progress) {
    return (
      <>
        <DashboardSkeleton
          safeAreaTop={insets.top}
          bottomNavInset={bottomNavInset}
        />
        <BottomNav navigation={navigation} route="Dashboard" />
      </>
    );
  }

  const { currentLevel, xpIntoLevel, xpForNext } = xpToNextLevel(progress.xp);
  const nextLevel = currentLevel + 1;
  const xpRemaining = Math.max(0, xpForNext - xpIntoLevel);
  const today = new Date().toISOString().slice(0, 10);
  const daily =
    progress.dailyExerciseDate === today ? progress.dailyExerciseCount ?? 0 : 0;
  const modTitle =
    getModuleById(progress.currentModuleId)?.title ?? progress.currentModuleId;
  const currentLesson = getLesson(
    progress.currentModuleId,
    progress.currentLessonId,
  );
  const lessonLabel = currentLesson?.title ?? progress.currentLessonId;
  const lessonOperation = currentLesson?.operation ?? "add";
  const continueParams = {
    moduleId: progress.currentModuleId,
    lessonId: progress.currentLessonId,
  };

  const totalAnswers = progress.stats.correct + progress.stats.wrong;
  const hasExerciseHistory = totalAnswers > 0;
  const rate =
    totalAnswers > 0
      ? Math.round((progress.stats.correct / totalAnswers) * 100)
      : 0;
  const wrongPct =
    totalAnswers > 0
      ? Math.round((progress.stats.wrong / totalAnswers) * 100)
      : 0;
  const weekValues = weekBarsFromProgress(progress.xp, progress.lastActiveDate);
  const hasWeeklyXp = weekValues.some((v) => v > 0);
  const linePoints = [0, 0, 0, rate];
  const lineLabels = ["Jan", "Fev", "Mar", "Abr"];
  const tips = [
    "Continue praticando diariamente para manter sua sequência",
    "Revise lições anteriores para reforçar o aprendizado",
    rate >= 60
      ? "Sua taxa de acerto está ótima! Mantenha o ritmo"
      : "Foque nas lições com mais erros para subir sua taxa",
  ];

  const greetingName = displayName || (demo ? "Visitante" : "Estudante");

  return (
    <ScreenBackground edgeToEdge>
      {isFocused ? <StatusBar style="light" /> : null}
      <ScrollView
        contentContainerStyle={styles.scrollRoot}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handlePullRefresh()}
            tintColor={colors.textOnPrimary}
            colors={[colors.textOnPrimary]}
            progressBackgroundColor={colors.primary}
          />
        }
      >
        <View style={styles.heroBanner}>
          <View style={[layout.heroBlob, { top: -30, right: -20 }]} />
          <View style={[layout.heroBlobSmall, { bottom: 8, left: -10 }]} />
          <View style={styles.heroRow}>
            <ProfileAvatar avatarId={avatarId} size={58} />
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>Olá!</Text>
              <Text style={styles.heroName} numberOfLines={2}>
                {greetingName}
              </Text>
              <Text style={styles.heroSub}>Pronto para aprender hoje?</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              style={styles.heroProfileBtn}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
            >
              <Ionicons name="chevron-forward" size={20} color={colors.textOnPrimary} />
            </Pressable>
          </View>
          <View style={styles.heroPills}>
            <View style={styles.heroPill}>
              <Ionicons name="ribbon-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.heroPillTxt}>Nível {currentLevel}</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="flame-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.heroPillTxt}>{progress.streak ?? 0} dias</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="star-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.heroPillTxt}>{progress.xp} XP</Text>
            </View>
          </View>
        </View>

        <View style={layout.scrollBody}>
        {demo && showDemoBanner && (
          <View style={styles.banner}>
            <Ionicons name="warning-outline" size={22} color={colors.warning} />
            <Text style={styles.bannerTxt} accessibilityRole="text">
              Modo demonstração ativo. Configure EXPO_PUBLIC_* no arquivo .env para conectar ao
              Firebase.
            </Text>
            <Pressable
              onPress={() => setShowDemoBanner(false)}
              hitSlop={10}
              accessibilityLabel="Fechar aviso"
            >
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>
        )}

        <View style={styles.continueHero}>
          <View style={[layout.heroBlob, { top: -40, right: -24, opacity: 0.9 }]} />
          <Text style={styles.continueEyebrow}>De onde você parou</Text>
          <View style={styles.continueRow}>
            <LessonIconCircle
              lessonId={progress.currentLessonId}
              operation={lessonOperation}
              isDone={false}
              open
              size={52}
            />
            <View style={styles.continueText}>
              <Text style={styles.continueLesson} numberOfLines={2}>
                {lessonLabel}
              </Text>
              <Text style={styles.continueModule} numberOfLines={1}>
                {modTitle}
              </Text>
            </View>
          </View>
          <AppButton
            label="Continuar teoria"
            variant="inverse"
            icon="play"
            iconSize={22}
            onPress={() => navigation.navigate("TheoryDetail", continueParams)}
            style={styles.continueBtnFirst}
            accessibilityLabel={`Continuar teoria: ${lessonLabel}`}
          />
          <AppButton
            label="Praticar agora"
            variant="outline"
            icon="barbell-outline"
            onPress={() => navigation.navigate("Exercise", continueParams)}
            style={styles.continueBtnSecond}
            accessibilityLabel={`Praticar: ${lessonLabel}`}
          />
        </View>

        <AppCard>
          <Text style={layout.sectionEyebrow}>Seu nível</Text>
          <View style={styles.levelRow}>
            <View style={styles.levelLeft}>
              <Text style={styles.levelNum}>{currentLevel}</Text>
              <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
            </View>
            <View style={styles.ribbonWrap}>
              <Ionicons name="ribbon-outline" size={36} color={colors.primaryMuted} />
            </View>
          </View>
          <View style={styles.bar}>
            <View
              style={[
                styles.barFill,
                { width: `${(xpIntoLevel / xpForNext) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.levelFooter}>
            <Text style={styles.muted}>
              {xpIntoLevel} / {xpForNext} XP
            </Text>
            <Text style={styles.xpHint}>
              Faltam {xpRemaining} XP para o nível {nextLevel}
            </Text>
          </View>
        </AppCard>

        <DailyGoalStreakCard
          daily={daily}
          streak={progress.streak ?? 0}
        />

        <AppCard>
          <View style={layout.cardHead}>
            <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
            <Text style={layout.h2}>Seu desempenho</Text>
          </View>
          <View style={styles.metricsRow}>
            <View style={[styles.metricCell, { backgroundColor: colors.metricBlueBg }]}>
              <Text style={styles.metricLabel}>Nível</Text>
              <Text style={[styles.metricVal, { color: colors.metricBlueText }]}>
                {currentLevel}
              </Text>
            </View>
            <View style={[styles.metricCell, { backgroundColor: colors.metricPurpleBg }]}>
              <Text style={styles.metricLabel}>XP total</Text>
              <Text style={[styles.metricVal, { color: colors.primary }]}>{progress.xp}</Text>
            </View>
            <View style={[styles.metricCell, { backgroundColor: colors.metricGreenBg }]}>
              <Text style={styles.metricLabel}>Taxa</Text>
              <Text style={[styles.metricVal, { color: colors.success }]}>{rate}%</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, { backgroundColor: colors.streakBg }]}>
                <Ionicons name="pulse-outline" size={22} color={colors.streak} />
              </View>
              <Text style={styles.statNum}>{progress.streak ?? 0}</Text>
              <Text style={styles.statLabel}>Sequência</Text>
            </View>
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, { backgroundColor: colors.successBg }]}>
                <Ionicons name="checkmark" size={22} color={colors.success} />
              </View>
              <Text style={styles.statNum}>{progress.stats.correct}</Text>
              <Text style={styles.statLabel}>Acertos</Text>
            </View>
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, { backgroundColor: colors.errorBg }]}>
                <Ionicons name="close" size={22} color={colors.error} />
              </View>
              <Text style={styles.statNum}>{progress.stats.wrong}</Text>
              <Text style={styles.statLabel}>Erros</Text>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <View style={layout.cardHead}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={layout.h2}>Atividade semanal</Text>
          </View>
          {hasWeeklyXp ? (
            <WeeklyXpChart values={weekValues} />
          ) : (
            <ChartEmptyPlaceholder
              message="Pratique para ver sua atividade semanal aqui."
              actionLabel="Ir para a trilha"
              onAction={() => navigation.navigate("LearningPath")}
            />
          )}
        </AppCard>

        <AppCard>
          <View style={layout.cardHead}>
            <Ionicons name="trending-up" size={22} color={colors.success} />
            <Text style={layout.h2}>Evolução da taxa de acerto</Text>
          </View>
          {hasExerciseHistory ? (
            <SuccessRateLineChart points={linePoints} labels={lineLabels} />
          ) : (
            <ChartEmptyPlaceholder
              message="Pratique exercícios para ver sua evolução de acertos."
              actionLabel="Praticar agora"
              onAction={() => navigation.navigate("Exercise", continueParams)}
            />
          )}
        </AppCard>

        <AppCard>
          <View style={layout.cardHead}>
            <Ionicons name="locate-outline" size={22} color={colors.primary} />
            <Text style={layout.h2}>Estatísticas detalhadas</Text>
          </View>
          <View style={styles.detailOk}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={styles.detailMid}>
              <Text style={styles.detailLbl}>Total de acertos</Text>
              <Text style={styles.detailNum}>{progress.stats.correct}</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailSmall}>do total</Text>
              <Text style={styles.detailPctOk}>{rate}%</Text>
            </View>
          </View>
          <View style={styles.detailBad}>
            <View style={[styles.detailIconWrap, styles.detailIconBad]}>
              <Ionicons name="close" size={20} color="#fff" />
            </View>
            <View style={styles.detailMid}>
              <Text style={styles.detailLbl}>Total de erros</Text>
              <Text style={styles.detailNum}>{progress.stats.wrong}</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailSmall}>do total</Text>
              <Text style={styles.detailPctBad}>{wrongPct}%</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <Text style={styles.detailTotalFoot}>
            Total de {totalAnswers} exercícios completados
          </Text>
        </AppCard>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHead}>
            <Ionicons name="information-circle" size={22} color={colors.infoText} />
            <Text style={styles.tipsTitle}>Dicas para melhorar</Text>
          </View>
          {tips.map((t, i) => (
            <Text key={i} style={styles.tipLine}>
              • {t}
            </Text>
          ))}
        </View>
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} route="Dashboard" />
    </ScreenBackground>
  );
}

function createDashboardStyles(
  colors: ColorTokens,
  layout: ThemeLayout,
  safeAreaTop: number,
  bottomNavInset: number,
) {
  return StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  scrollRoot: {
    paddingBottom: bottomNavInset,
  },
  heroBanner: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: safeAreaTop + 16,
    paddingBottom: 22,
    overflow: "hidden",
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    zIndex: 1,
  },
  heroText: { flex: 1, minWidth: 0 },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedOnPrimary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textOnPrimary,
    marginBottom: 2,
  },
  heroSub: {
    fontSize: 13,
    color: colors.mutedOnPrimary,
  },
  heroProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    zIndex: 1,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroPillTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.warningBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: 12,
  },
  bannerTxt: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  continueHero: {
    ...layout.heroBanner,
    gap: 14,
    overflow: "hidden",
  },
  continueEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.mutedOnPrimary,
    letterSpacing: 1,
    textTransform: "uppercase",
    zIndex: 1,
  },
  continueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    zIndex: 1,
  },
  continueText: { flex: 1, minWidth: 0 },
  continueLesson: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textOnPrimary,
    marginBottom: 4,
  },
  continueModule: {
    fontSize: 13,
    color: colors.mutedOnPrimary,
    fontWeight: "600",
  },
  continueBtnFirst: { marginTop: 0, zIndex: 1 },
  continueBtnSecond: { marginTop: 10, zIndex: 1 },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  levelLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  levelNum: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.primary,
  },
  ribbonWrap: {
    padding: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
  },
  bar: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  levelFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  xpHint: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  muted: { color: colors.muted, fontSize: 14 },
  metricsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metricCell: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    minHeight: 72,
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricVal: { fontSize: 20, fontWeight: "800" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 14,
  },
  statCol: { flex: 1, alignItems: "center", gap: 6 },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, textAlign: "center" },
  detailOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.successBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  detailBad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.errorBg,
    borderRadius: 14,
    padding: 14,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  detailIconBad: { backgroundColor: colors.error },
  detailMid: { flex: 1 },
  detailLbl: { fontSize: 13, color: colors.muted, marginBottom: 2 },
  detailNum: { fontSize: 24, fontWeight: "800", color: colors.text },
  detailRight: { alignItems: "flex-end" },
  detailSmall: { fontSize: 12, color: colors.muted },
  detailPctOk: { fontSize: 16, fontWeight: "700", color: colors.successDark },
  detailPctBad: { fontSize: 16, fontWeight: "700", color: colors.errorDark },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  detailTotalFoot: {
    textAlign: "center",
    fontSize: 13,
    color: colors.muted,
    fontWeight: "500",
  },
  tipsCard: {
    borderRadius: radius.card,
    padding: 16,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
  },
  tipsHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  tipsTitle: { fontSize: 16, fontWeight: "700", color: colors.infoText },
  tipLine: {
    fontSize: 14,
    color: colors.infoText,
    lineHeight: 22,
    marginBottom: 4,
  },
  });
}
