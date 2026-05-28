import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  DAILY_GOAL_EXERCISES,
  type ProfileAvatarId,
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
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { BottomNav } from "../components/BottomNav";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useAuthContext } from "../context/AuthContext";
import { useAppHeader } from "../hooks/useAppHeader";
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

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  useAppHeader(navigation, "Perfil", { showProfileButton: false });

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
        <View style={[styles.card, cardShadow, styles.errorCard]}>
          <Ionicons name="warning-outline" size={28} color={colors.error} />
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.muted}>{error}</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => void handleRefresh()}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnTxt}>Tentar novamente</Text>
            )}
          </Pressable>
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
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, cardShadow]}>
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
        </View>

        <View style={[styles.card, cardShadow]}>
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
        </View>

        <View style={[styles.card, cardShadow]}>
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
        </View>

        <View style={[styles.card, cardShadow]}>
          <Text style={styles.sectionTitle}>Meta diária</Text>
          <Text style={styles.dailyMeta}>
            {daily} de {DAILY_GOAL_EXERCISES} exercícios hoje
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${dailyPct}%` }]} />
          </View>
        </View>

        {error ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnTxt}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.secondaryBtn}
          onPress={() => void signOutUser()}
          accessibilityRole="button"
          accessibilityLabel={demo ? "Encerrar demonstração" : "Sair da conta"}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={demo ? colors.text : colors.error}
          />
          <Text style={[styles.secondaryBtnTxt, !demo && styles.signOutTxt]}>
            {demo ? "Encerrar demonstração" : "Sair da conta"}
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNav navigation={navigation} route="Profile" />

      <AvatarPickerModal
        visible={pickerOpen}
        selectedId={avatarId}
        onSelect={(id) => void handleSelectAvatar(id)}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 36, gap: 14 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.bg,
  },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 20,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  errorCard: { alignItems: "center", gap: 10, maxWidth: 320 },
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
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.btn,
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  secondaryBtnTxt: { fontWeight: "700", fontSize: 15, color: colors.text },
  signOutTxt: { color: colors.error },
  btnDisabled: { opacity: 0.7 },
  muted: { color: colors.muted, fontSize: 14, marginTop: 8 },
});
