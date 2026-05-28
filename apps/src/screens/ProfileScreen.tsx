import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  type ProfileAvatarId,
  xpToNextLevel,
} from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { CollapsibleSection } from "../components/CollapsibleSection";
import { DailyGoalStreakCard } from "../components/DailyGoalStreakCard";
import { EmptyState } from "../components/EmptyState";
import { ProfileSkeleton } from "../components/skeleton/ProfileSkeleton";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { BottomNav } from "../components/BottomNav";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { ScreenBackground } from "../components/ScreenBackground";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ThemeSettingsCard } from "../components/ThemeSettingsCard";
import { PressableScale } from "../components/PressableScale";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { triggerError, triggerSuccess } from "../lib/appHaptics";
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
  const { showToast } = useToast();

  const profileTitle = demo
    ? "Visitante (demonstração)"
    : displayName || email || "Conta sem email";
  const uidLabel = uid ?? "—";

  async function handleRefresh() {
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

  if (loading && !progress) {
    return (
      <>
        <ProfileSkeleton />
        <BottomNav navigation={navigation} route="Profile" />
      </>
    );
  }

  if (error && !progress) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <EmptyState
            title="Não foi possível carregar"
            message={error}
            actionLabel="Tentar novamente"
            onAction={() => void handleRefresh()}
            actionLoading={refreshing}
          />
        </View>
      </ScreenBackground>
    );
  }

  if (!progress) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <EmptyState
            title="Sem progresso ainda"
            message="Entre na sua conta ou use o modo demonstração para acompanhar seu perfil aqui."
            actionLabel="Ir para o início"
            onAction={() => navigation.navigate("Dashboard")}
            actionVariant="secondary"
          />
        </View>
      </ScreenBackground>
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
  async function handleSelectAvatar(id: ProfileAvatarId) {
    setSavingAvatar(true);
    try {
      await updateUserAvatar(id);
      setPickerOpen(false);
      void triggerSuccess();
      showToast({ message: "Avatar salvo", variant: "success" });
    } catch (e) {
      void triggerError();
      showToast({
        message: e instanceof Error ? e.message : "Não foi possível salvar o avatar",
        variant: "error",
      });
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
            <PressableScale
              style={styles.changeAvatarBtn}
              onPress={() => setPickerOpen(true)}
              disabled={savingAvatar}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto de perfil"
            >
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={styles.changeAvatarTxt}>Alterar</Text>
            </PressableScale>
          </View>
          <Text style={styles.name}>{profileTitle}</Text>
          {!demo && displayName && email ? (
            <Text style={styles.emailSub}>{email}</Text>
          ) : null}
          {demo ? (
            <View style={[styles.badge, styles.badgeDemo]}>
              <Text style={[styles.badgeTxt, styles.badgeTxtDemo]}>Modo demonstração</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeFirebase]}>
              <Text style={[styles.badgeTxt, styles.badgeTxtFirebase]}>Conta conectada</Text>
            </View>
          )}
        </AppCard>

        <CollapsibleSection title="Detalhes da conta">
          <AppCard>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>ID da conta</Text>
              <Text style={styles.statVal} selectable>
                {uidLabel}
              </Text>
            </View>
            {email ? (
              <View style={styles.statLine}>
                <Text style={styles.statLabel}>Email</Text>
                <Text style={styles.statVal} selectable>
                  {email}
                </Text>
              </View>
            ) : null}
          </AppCard>
        </CollapsibleSection>

        <Text style={layout.sectionEyebrow}>Progresso</Text>

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

        <DailyGoalStreakCard
          daily={daily}
          streak={progress.streak ?? 0}
          showStreak={false}
        />

        <Text style={layout.sectionEyebrow}>Aparência</Text>
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
