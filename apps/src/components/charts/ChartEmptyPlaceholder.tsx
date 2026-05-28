import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../AppButton";
import { useTheme } from "../../context/ThemeContext";
import { fontFamilies } from "../../theme/typography";
import type { ColorTokens } from "../../theme/tokens";

type ChartEmptyPlaceholderProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ChartEmptyPlaceholder({
  message,
  actionLabel,
  onAction,
}: ChartEmptyPlaceholderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={message}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="bar-chart-outline" size={28} color={colors.muted} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          style={styles.btn}
        />
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: {
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 16,
      gap: 8,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.cardMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    message: {
      fontFamily: fontFamilies.regular,
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 21,
      maxWidth: 280,
    },
    btn: {
      marginTop: 8,
      alignSelf: "stretch",
      maxWidth: 260,
    },
  });
}
