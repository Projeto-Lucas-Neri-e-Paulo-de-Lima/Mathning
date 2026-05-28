import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  DAILY_GOAL_EXERCISES,
  getLesson,
  getModuleById,
  xpToNextLevel,
} from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SuccessRateLineChart } from "../components/charts/SuccessRateLineChart";
import { WeeklyXpChart } from "../components/charts/WeeklyXpChart";
import { BottomNav } from "../components/BottomNav";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useAuthContext } from "../context/AuthContext";
import { useAppHeader } from "../hooks/useAppHeader";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme/colors";

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

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: { elevation: 4 },
  default: {},
});

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  useAppHeader(navigation, "Mathning", { showProfileButton: false });
  const { progress, loading, error, demo, displayName, avatarId, signOutUser } =
    useAuthContext();
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Ionicons name="warning-outline" size={28} color={colors.error} />
          <Text style={styles.errorTitle}>Erro ao carregar progresso</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => void signOutUser()}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnTxt}>Voltar ao login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (loading || !progress) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Carregando...</Text>
      </View>
    );
  }

  const { currentLevel, xpIntoLevel, xpForNext } = xpToNextLevel(progress.xp);
  const nextLevel = currentLevel + 1;
  const xpRemaining = Math.max(0, xpForNext - xpIntoLevel);
  const today = new Date().toISOString().slice(0, 10);
  const daily =
    progress.dailyExerciseDate === today ? progress.dailyExerciseCount ?? 0 : 0;
  const dailyPct = Math.min(100, Math.round((daily / DAILY_GOAL_EXERCISES) * 100));
  const goalMet = daily >= DAILY_GOAL_EXERCISES;
  const modTitle =
    getModuleById(progress.currentModuleId)?.title ?? progress.currentModuleId;
  const lessonLabel =
    getLesson(progress.currentModuleId, progress.currentLessonId)?.title ??
    progress.currentLessonId;

  const totalAnswers = progress.stats.correct + progress.stats.wrong;
  const rate =
    totalAnswers > 0
      ? Math.round((progress.stats.correct / totalAnswers) * 100)
      : 0;
  const wrongPct =
    totalAnswers > 0
      ? Math.round((progress.stats.wrong / totalAnswers) * 100)
      : 0;
  const weekValues = weekBarsFromProgress(progress.xp, progress.lastActiveDate);
  const linePoints = [0, 0, 0, rate];
  const lineLabels = ["Jan", "Fev", "Mar", "Abr"];
  const tips = [
    "Continue praticando diariamente para manter sua sequência",
    "Revise lições anteriores para reforçar o aprendizado",
    rate >= 60
      ? "Sua taxa de acerto está ótima! Mantenha o ritmo"
      : "Foque nas lições com mais erros para subir sua taxa",
  ];

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.welcomeRow, cardShadow]}>
          <ProfileAvatar avatarId={avatarId} size={56} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeEyebrow}>Olá!</Text>
            <Text style={styles.welcomeName} numberOfLines={2}>
              {displayName || (demo ? "Visitante" : "Estudante")}
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
            >
              <Text style={styles.welcomeLink}>Ver perfil</Text>
            </Pressable>
          </View>
        </View>

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

        <View style={[styles.card, cardShadow]}>
          <Text style={styles.eyebrow}>Seu nível</Text>
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
        </View>

        <View style={[styles.card, cardShadow]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIconBox}>
              <Ionicons name="locate-outline" size={22} color={colors.success} />
            </View>
            <View style={styles.goalTitles}>
              <Text style={styles.h2}>Meta de hoje</Text>
              <Text style={styles.muted}>
                {daily} de {DAILY_GOAL_EXERCISES} exercícios
              </Text>
            </View>
            {goalMet && (
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            )}
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, styles.barGreen, { width: `${dailyPct}%` }]} />
          </View>
          {goalMet && (
            <View style={styles.goalSuccessRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.goalSuccessTxt}>Parabéns! Meta de hoje concluída!</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, cardShadow]}>
          <Text style={styles.h2}>Continuar</Text>
          <Text style={styles.muted}>
            <Text>Módulo: </Text>
            <Text style={styles.bold}>{modTitle}</Text>
            <Text> · Lição: </Text>
            <Text style={styles.bold}>{lessonLabel}</Text>
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("TheoryDetail", {
                moduleId: progress.currentModuleId,
                lessonId: progress.currentLessonId,
              })
            }
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.primaryBtnTxt}>Continuar de onde parei</Text>
          </Pressable>
        </View>

        <View style={[styles.card, cardShadow]}>
          <View style={styles.cardHead}>
            <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
            <Text style={styles.h2}>Seu desempenho</Text>
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
        </View>

        <View style={[styles.card, cardShadow]}>
          <View style={styles.cardHead}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={styles.h2}>Atividade semanal</Text>
          </View>
          <WeeklyXpChart values={weekValues} />
        </View>

        <View style={[styles.card, cardShadow]}>
          <View style={styles.cardHead}>
            <Ionicons name="trending-up" size={22} color={colors.success} />
            <Text style={styles.h2}>Evolução da taxa de acerto</Text>
          </View>
          <SuccessRateLineChart points={linePoints} labels={lineLabels} />
        </View>

        <View style={[styles.card, cardShadow]}>
          <View style={styles.cardHead}>
            <Ionicons name="locate-outline" size={22} color={colors.primary} />
            <Text style={styles.h2}>Estatísticas detalhadas</Text>
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
        </View>

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
      </ScrollView>
      <BottomNav navigation={navigation} route="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 32, gap: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  welcomeText: { flex: 1, minWidth: 0 },
  welcomeEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  welcomeLink: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryText,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.primaryText,
    fontWeight: "600",
    marginBottom: 6,
  },
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
  barGreen: { backgroundColor: colors.success },
  levelFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  xpHint: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  muted: { color: colors.muted, fontSize: 14 },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  h2: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 0,
  },
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
  bold: { fontWeight: "700", color: colors.text },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  goalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.successBg,
    alignItems: "center",
    justifyContent: "center",
  },
  goalTitles: { flex: 1 },
  goalSuccessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  goalSuccessTxt: { color: colors.successDark, fontSize: 14, fontWeight: "600" },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.btn,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
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
  errorCard: {
    width: "88%",
    maxWidth: 460,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.errorBg,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  err: { color: colors.error, textAlign: "center", lineHeight: 20 },
  secondaryBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.btn,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryBtnTxt: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
