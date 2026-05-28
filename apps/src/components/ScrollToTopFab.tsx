import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { fontFamilies } from "../theme/typography";
import { radius } from "../theme/radius";
import { triggerLightImpact } from "../lib/appHaptics";
import type { ColorTokens } from "../theme/tokens";

type ScrollToTopFabProps = {
  visible: boolean;
  onPress: () => void;
};

export function ScrollToTopFab({ visible, onPress }: ScrollToTopFabProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!visible) return null;

  return (
    <Pressable
      style={styles.fab}
      onPress={() => {
        void triggerLightImpact();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="Voltar ao topo"
      accessibilityHint="Rola o conteúdo de teoria para o início"
    >
      <Ionicons name="arrow-up" size={20} color={colors.textOnPrimary} />
      <Text style={styles.txt}>Topo</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 20,
    },
    txt: {
      fontFamily: fontFamilies.bold,
      fontSize: 13,
      color: colors.textOnPrimary,
    },
  });
}
