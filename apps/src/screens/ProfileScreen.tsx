import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  DAILY_GOAL_EXERCISES,
  type ProfileAvatarId,
  xpToNextLevel,
} from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { BottomNav } from "../components/BottomNav";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { ScreenBackground } from "../components/ScreenBackground";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ThemeSettingsCard } from "../components/ThemeSettingsCard";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAppHeader } from "../hooks/useAppHeader";
import type { RootStackParamList } from "../navigation/types";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";
import type { ThemeLayout } from "../theme/ui";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  useAppHeader(navigation);
  const { colors, layout, cardShadow } = useTheme();
  const styles = useMemo(
    () => createProfileStyles(colors, layout, cardShadow),
    [colors, layout, cardShadow],
  );

  const {
    uid,
    email,
    displayName,
    avatarId,
    progress,
    loading,
    error,
    demo,
    refreshProgress,
    updateUserAvatar,
    signOutUser,
  } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const profileTitle = demo
    ? "Visitante (demonstração)"
    : displayName || email || "Conta sem email";
  const uidLabel = uid ?? "—";

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshProgress();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !progress) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Carregando perfil...</Text>
      </View>
    );
  }

  if (error && !progress) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Ionicons name="warning-outline" size={28} color={colors.error} />
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.muted}>{error}</Text>
          <AppButton
            label="Tentar novamente"
            onPress={() => void handleRefresh()}
            loading={refreshing}
            style={styles.actionBtn}
          />
        </View>
      </View>
    );
  }

  if (!progress) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Nenhum progresso disponível.</Text>
      </View>
    );
  }

  const { currentLevel, xpIntoLevel, xpForNext } = xpToNextLevel(progress.xp);
  const xpRemaining = Math.max(0, xpForNext - xpIntoLevel);
  const totalAnswers = progress.stats.correct + progress.stats.wrong;
  const accuracy =
    totalAnswers > 0
      ? Math.round((progress.stats.correct / totalAnswers) * 100)
      : 0;
  const lessonsDone = progress.completedLessonIds?.length ?? 0;
  const practicedCount = progress.practicedLessonIds?.length ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const daily =
    progress.dailyExerciseDate === today ? (progress.dailyExerciseCount ?? 0) : 0;
  const dailyPct = Math.min(
    100,
    Math.round((daily / DAILY_GOAL_EXERCISES) * 100),
  );

  async function handleSelectAvatar(id: ProfileAvatarId) {
    setSavingAvatar(true);
    try {
      await updateUserAvatar(id);
      setPickerOpen(false);
    } finally {
      setSavingAvatar(false);
    }
  }

  return (
    <ScreenBackground>
      <ScreenScrollView
        withBottomNav
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <AppCard variant="accent" style={styles.hero}>
          <View style={styles.avatarBlock}>
            <ProfileAvatar avatarId={avatarId} size={96} />
            <Pressable
              style={styles.changeAvatarBtn}
              onPress={() => setPickerOpen(true)}
              disabled={savingAvatar}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto de perfil"
            >
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={styles.changeAvatarTxt}>Alterar</Text>
            </Pressable>
          </View>
          <Text style={styles.name}>{profileTitle}</Text>
          {!demo && displayName && email ? (
            <Text style={styles.emailSub}>{email}</Text>
          ) : null}
          <Text style={styles.uid}>ID: {uidLabel}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Atividade</Text>
          <View style={styles.metricsRow}>
            <View style={[styles.metric, { backgroundColor: colors.metricBlueBg }]}>
              <Text style={styles.metricLabel}>Nível</Text>
              <Text style={[styles.metricVal, { color: colors.metricBlueText }]}>
                {currentLevel}
              </Text>
            </View>
            <View style={[styles.metric, { backgroundColor: colors.metricPurpleBg }]}>
              <Text style={styles.metricLabel}>XP</Text>
              <Text style={[styles.metricVal, { color: colors.primary }]}>
                {progress.xp}
              </Text>
            </View>
            <View style={[styles.metric, { backgroundColor: colors.streakBg }]}>
              <Text style={styles.metricLabel}>Sequência</Text>
              <Text style={[styles.metricVal, { color: colors.streak }]}>
                {progress.streak ?? 0}
              </Text>
            </View>
          </View>
          <Text style={styles.xpHint}>
            Faltam {xpRemaining} XP para o nível {currentLevel + 1}
          </Text>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Taxa de acerto</Text>
            <Text style={styles.statVal}>{accuracy}%</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Acertos / erros</Text>
            <Text style={styles.statVal}>
              {progress.stats.correct} / {progress.stats.wrong}
            </Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Lições concluídas (teoria)</Text>
            <Text style={styles.statVal}>{lessonsDone}</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Assuntos praticados</Text>
            <Text style={styles.statVal}>{practicedCount}</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>Última atividade</Text>
            <Text style={styles.statVal}>{formatDate(progress.lastActiveDate)}</Text>
          </View>
        </AppCard>

        <AppCard variant="tint">
          <Text style={styles.sectionTitle}>Meta diária</Text>
          <Text style={styles.dailyMeta}>
            {daily} de {DAILY_GOAL_EXERCISES} exercícios hoje
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${dailyPct}%` }]} />
          </View>
        </AppCard>

        <ThemeSettingsCard />

        {error ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnTxt}>{error}</Text>
          </View>
        ) : null}

        <AppButton
          label={demo ? "Encerrar demonstração" : "Sair da conta"}
          variant={demo ? "secondary" : "danger"}
          icon="log-out-outline"
          onPress={() => void signOutUser()}
          style={styles.actionBtn}
          accessibilityLabel={demo ? "Encerrar demonstração" : "Sair da conta"}
        />
      </ScreenScrollView>

      <BottomNav navigation={navigation} route="Profile" />

      <AvatarPickerModal
        visible={pickerOpen}
        selectedId={avatarId}
        onSelect={(id) => void handleSelectAvatar(id)}
        onClose={() => setPickerOpen(false)}
      />
    </ScreenBackground>
  );
}

function createProfileStyles(
  colors: ColorTokens,
  layout: ThemeLayout,
  cardShadow: ReturnType<typeof import("../theme/ui").createCardShadow>,
) {
  return StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.bg,
  },
  hero: {
    alignItems: "center",
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  changeAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  changeAvatarTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 6,
  },
  badgeDemo: { backgroundColor: colors.warningBg },
  badgeFirebase: { backgroundColor: colors.primaryMuted },
  badgeTxt: { fontSize: 12, fontWeight: "700" },
  badgeTxtDemo: { color: colors.warning },
  badgeTxtFirebase: { color: colors.primaryText },
  emailSub: { fontSize: 14, color: colors.muted, marginBottom: 4 },
  uid: { fontSize: 11, color: colors.muted, marginTop: 4 },
  errorCard: {
    alignItems: "center",
    gap: 10,
    maxWidth: 320,
    ...layout.card,
    ...cardShadow,
  },
  errorTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  metricsRow: { flexDirection: "row", gap: 8 },
  metric: {
    flex: 1,
    borderRadius: radius.sm,
    padding: 10,
    alignItems: "center",
  },
  metricLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  metricVal: { fontSize: 20, fontWeight: "800" },
  xpHint: { fontSize: 12, color: colors.muted, marginTop: 10 },
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statLabel: { fontSize: 14, color: colors.muted, flex: 1 },
  statVal: { fontSize: 14, fontWeight: "700", color: colors.text },
  dailyMeta: { fontSize: 14, color: colors.muted, marginBottom: 8 },
  barTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  warnBox: {
    backgroundColor: colors.errorBg,
    padding: 12,
    borderRadius: radius.sm,
  },
  warnTxt: { color: colors.errorDark, fontSize: 13 },
  actionBtn: { marginTop: 0 },
  btnDisabled: { opacity: 0.7 },
  muted: { color: colors.muted, fontSize: 14, marginTop: 8 },
  });
}
