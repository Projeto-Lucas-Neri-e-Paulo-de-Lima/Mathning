import { StyleSheet, View } from "react-native";
import { AppCard } from "../AppCard";
import { ScreenBackground } from "../ScreenBackground";
import { ScreenScrollView } from "../ScreenScrollView";
import { SkeletonBox, SkeletonCircle } from "./SkeletonBox";
import { radius } from "../../theme/radius";

export function ProfileSkeleton() {
  const styles = createStyles();

  return (
    <ScreenBackground>
      <ScreenScrollView
        withBottomNav
        accessibilityLabel="Carregando perfil"
        accessibilityRole="progressbar"
      >
        <AppCard variant="accent" style={styles.hero}>
          <View style={styles.avatarBlock}>
            <SkeletonCircle size={96} />
            <SkeletonBox width={120} height={36} borderRadius={radius.btn} />
          </View>
          <SkeletonBox width="70%" height={22} style={styles.centerLine} />
          <SkeletonBox width="45%" height={14} style={styles.gapSm} />
        </AppCard>

        <AppCard variant="tint">
          <SkeletonBox width="32%" height={10} />
          <View style={styles.goalRow}>
            <SkeletonCircle size={88} />
            <View style={styles.goalSide}>
              <SkeletonBox width="85%" height={14} />
              <SkeletonBox width="60%" height={12} style={styles.gapSm} />
            </View>
          </View>
        </AppCard>

        <SkeletonBox width="35%" height={16} style={styles.sectionGap} />

        <View style={styles.metricsRow}>
          <SkeletonBox style={styles.metric} height={72} borderRadius={radius.sm} />
          <SkeletonBox style={styles.metric} height={72} borderRadius={radius.sm} />
          <SkeletonBox style={styles.metric} height={72} borderRadius={radius.sm} />
        </View>

        <AppCard style={styles.themeCard}>
          <SkeletonBox width="40%" height={16} />
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.themeRow}>
              <SkeletonCircle size={22} />
              <SkeletonBox width="50%" height={14} />
            </View>
          ))}
        </AppCard>
      </ScreenScrollView>
    </ScreenBackground>
  );
}

function createStyles() {
  return StyleSheet.create({
    hero: { alignItems: "center", gap: 12 },
    avatarBlock: { alignItems: "center", gap: 14 },
    centerLine: { alignSelf: "center" },
    goalRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 },
    goalSide: { flex: 1, minWidth: 0 },
    sectionGap: { marginTop: 4, marginBottom: 12 },
    metricsRow: { flexDirection: "row", gap: 8 },
    metric: { flex: 1 },
    themeCard: { gap: 14, marginTop: 4 },
    themeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    gapSm: { marginTop: 8 },
  });
}
