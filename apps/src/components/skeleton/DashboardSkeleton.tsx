import { ScrollView, StyleSheet, View } from "react-native";
import { AppCard } from "../AppCard";
import { ScreenBackground } from "../ScreenBackground";
import { SkeletonBox, SkeletonCircle } from "./SkeletonBox";
import { useTheme } from "../../context/ThemeContext";
import { radius } from "../../theme/radius";
import type { ThemeLayout } from "../../theme/ui";

type DashboardSkeletonProps = {
  safeAreaTop: number;
  bottomNavInset: number;
};

export function DashboardSkeleton({
  safeAreaTop,
  bottomNavInset,
}: DashboardSkeletonProps) {
  const { colors, layout } = useTheme();
  const styles = createStyles(colors, layout, safeAreaTop);

  return (
    <ScreenBackground edgeToEdge>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomNavInset }}
        accessibilityLabel="Carregando início"
        accessibilityRole="progressbar"
      >
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <SkeletonCircle size={58} variant="onPrimary" />
            <View style={styles.heroText}>
              <SkeletonBox variant="onPrimary" width="38%" height={12} />
              <SkeletonBox
                variant="onPrimary"
                width="72%"
                height={22}
                style={styles.gapSm}
              />
              <SkeletonBox variant="onPrimary" width="55%" height={12} style={styles.gapSm} />
            </View>
            <SkeletonBox
              variant="onPrimary"
              width={36}
              height={36}
              borderRadius={18}
            />
          </View>
          <View style={styles.heroPills}>
            <SkeletonBox variant="onPrimary" width={88} height={28} borderRadius={radius.pill} />
            <SkeletonBox variant="onPrimary" width={72} height={28} borderRadius={radius.pill} />
            <SkeletonBox variant="onPrimary" width={64} height={28} borderRadius={radius.pill} />
          </View>
        </View>

        <View style={layout.scrollBody}>
          <View style={[layout.heroBanner, styles.continueBlock]}>
            <SkeletonBox variant="onPrimary" width="42%" height={10} />
            <View style={styles.continueRow}>
              <SkeletonCircle size={52} variant="onPrimary" />
              <View style={styles.continueText}>
                <SkeletonBox variant="onPrimary" width="85%" height={18} />
                <SkeletonBox
                  variant="onPrimary"
                  width="60%"
                  height={12}
                  style={styles.gapSm}
                />
              </View>
            </View>
            <SkeletonBox variant="onPrimary" height={48} borderRadius={radius.btn} />
            <SkeletonBox
              variant="onPrimary"
              height={48}
              borderRadius={radius.btn}
              style={styles.gapSm}
            />
          </View>

          <AppCard>
            <SkeletonBox width="28%" height={10} />
            <SkeletonBox width={56} height={48} style={styles.gapMd} />
            <SkeletonBox height={8} borderRadius={radius.pill} />
            <View style={styles.levelFooter}>
              <SkeletonBox width="35%" height={12} />
              <SkeletonBox width="50%" height={12} />
            </View>
          </AppCard>

          <AppCard variant="tint">
            <SkeletonBox width="32%" height={10} />
            <View style={styles.goalRow}>
              <SkeletonCircle size={96} />
              <View style={styles.goalSide}>
                <SkeletonBox width="90%" height={14} />
                <SkeletonBox width="70%" height={12} style={styles.gapSm} />
                <View style={styles.dotsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonBox
                      key={i}
                      width={28}
                      height={28}
                      borderRadius={14}
                      style={styles.dot}
                    />
                  ))}
                </View>
              </View>
            </View>
          </AppCard>

          <AppCard>
            <SkeletonBox width="40%" height={16} />
            <View style={styles.metricsRow}>
              <SkeletonBox style={styles.metric} height={64} borderRadius={radius.sm} />
              <SkeletonBox style={styles.metric} height={64} borderRadius={radius.sm} />
              <SkeletonBox style={styles.metric} height={64} borderRadius={radius.sm} />
            </View>
            <SkeletonBox height={120} borderRadius={radius.sm} style={styles.gapMd} />
          </AppCard>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(
  colors: { primary: string },
  _layout: ThemeLayout,
  safeAreaTop: number,
) {
  return StyleSheet.create({
    hero: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingTop: safeAreaTop + 16,
      paddingBottom: 22,
      borderBottomLeftRadius: radius.hero,
      borderBottomRightRadius: radius.hero,
      gap: 16,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    heroText: { flex: 1, minWidth: 0 },
    heroPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    continueBlock: { gap: 14, overflow: "hidden" },
    continueRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    continueText: { flex: 1, minWidth: 0 },
    goalRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
    goalSide: { flex: 1, minWidth: 0 },
    dotsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    dot: { flex: 0 },
    metricsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
    metric: { flex: 1 },
    levelFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    gapSm: { marginTop: 8 },
    gapMd: { marginTop: 14 },
  });
}
