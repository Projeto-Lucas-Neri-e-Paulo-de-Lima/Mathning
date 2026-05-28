import { StyleSheet, View } from "react-native";
import { AppCard } from "../AppCard";
import { ScreenBackground } from "../ScreenBackground";
import { ScreenScrollView } from "../ScreenScrollView";
import { SkeletonBox, SkeletonCircle } from "./SkeletonBox";
import { useTheme } from "../../context/ThemeContext";
import { radius } from "../../theme/radius";
export function HubListSkeleton() {
  const { colors, layout } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScreenBackground>
      <ScreenScrollView
        withBottomNav
        accessibilityLabel="Carregando lista"
        accessibilityRole="progressbar"
      >
        <View style={[layout.heroBanner, styles.hero]}>
          <View style={styles.heroTop}>
            <SkeletonBox variant="onPrimary" width={48} height={48} borderRadius={14} />
            <View style={styles.heroText}>
              <SkeletonBox variant="onPrimary" width="55%" height={20} />
              <SkeletonBox
                variant="onPrimary"
                width="90%"
                height={12}
                style={styles.gapSm}
              />
              <SkeletonBox
                variant="onPrimary"
                width="75%"
                height={12}
                style={styles.gapSm}
              />
            </View>
          </View>
          <View style={styles.heroMeta}>
            <SkeletonBox variant="onPrimary" width={96} height={28} borderRadius={radius.pill} />
            <SkeletonBox variant="onPrimary" width={120} height={28} borderRadius={radius.pill} />
          </View>
        </View>

        {[0, 1].map((phase) => (
          <View key={phase} style={styles.phaseSection}>
            <AppCard variant="accent" style={styles.phaseCard}>
              <View style={styles.phaseTop}>
                <SkeletonCircle size={48} />
                <View style={styles.phaseHead}>
                  <SkeletonBox width="30%" height={10} />
                  <SkeletonBox width="70%" height={18} style={styles.gapSm} />
                  <SkeletonBox width="95%" height={12} style={styles.gapSm} />
                </View>
              </View>
              <SkeletonBox height={8} borderRadius={radius.pill} style={styles.gapMd} />
            </AppCard>

            {[0, 1].map((row) => (
              <View key={row} style={styles.lessonRow}>
                <SkeletonCircle size={44} />
                <View style={styles.lessonMain}>
                  <SkeletonBox width="75%" height={16} />
                  <SkeletonBox width="50%" height={12} style={styles.gapSm} />
                </View>
                <SkeletonBox width={72} height={36} borderRadius={10} />
              </View>
            ))}
          </View>
        ))}
      </ScreenScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: { card: string; cardBorder: string }) {
  return StyleSheet.create({
    hero: { marginBottom: 4, gap: 14 },
    heroTop: { flexDirection: "row", gap: 12, zIndex: 1 },
    heroText: { flex: 1, minWidth: 0 },
    heroMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, zIndex: 1 },
    phaseSection: { gap: 8 },
    phaseCard: { marginBottom: 4 },
    phaseTop: { flexDirection: "row", gap: 14 },
    phaseHead: { flex: 1, minWidth: 0 },
    lessonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: radius.card,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    lessonMain: { flex: 1, minWidth: 0 },
    gapSm: { marginTop: 8 },
    gapMd: { marginTop: 14 },
  });
}
