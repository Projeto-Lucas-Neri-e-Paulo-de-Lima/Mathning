import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { AppButton, type AppButtonVariant } from "./AppButton";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";
import { fontFamilies } from "../theme/typography";
import type { ColorTokens } from "../theme/tokens";

const MASCOT_SOURCE = require("../../assets/avatars/mascot-purple.png");

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: AppButtonVariant;
  actionLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  actionVariant = "primary",
  actionLoading = false,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const showAction = Boolean(actionLabel && onAction);

  return (
    <View style={[styles.wrap, style]} accessibilityRole="summary">
      <View style={styles.mascotCircle}>
        <Image source={MASCOT_SOURCE} style={styles.mascot} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {showAction ? (
        <AppButton
          label={actionLabel!}
          onPress={onAction!}
          variant={actionVariant}
          loading={actionLoading}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingVertical: 32,
      maxWidth: 340,
      alignSelf: "center",
    },
    mascotCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    mascot: {
      width: 88,
      height: 88,
    },
    title: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 20,
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    message: {
      fontFamily: fontFamilies.regular,
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 4,
    },
    action: {
      marginTop: 18,
      alignSelf: "stretch",
      minWidth: 200,
    },
  });
}
