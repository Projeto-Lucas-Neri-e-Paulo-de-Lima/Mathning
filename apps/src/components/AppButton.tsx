import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "inverse"
  | "outline";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: IoniconName;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  iconSize = 20,
  style,
  labelStyle,
  accessibilityLabel,
}: AppButtonProps) {
  const { colors } = useTheme();
  const palette = getVariantStyles(colors, variant);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        palette.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={palette.spinner} />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={iconSize} color={palette.text.color} />
          ) : null}
          <Text style={[styles.label, palette.text, labelStyle]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function getVariantStyles(colors: ColorTokens, variant: AppButtonVariant) {
  switch (variant) {
    case "secondary":
      return {
        container: {
          backgroundColor: colors.card,
          borderColor: colors.border,
        } as ViewStyle,
        text: { color: colors.text } as TextStyle,
        spinner: colors.primary,
      };
    case "ghost":
      return {
        container: {
          backgroundColor: "transparent",
          borderColor: "transparent",
        } as ViewStyle,
        text: { color: colors.primary } as TextStyle,
        spinner: colors.primary,
      };
    case "danger":
      return {
        container: {
          backgroundColor: colors.card,
          borderColor: colors.error,
        } as ViewStyle,
        text: { color: colors.error } as TextStyle,
        spinner: colors.error,
      };
    case "inverse":
      return {
        container: {
          backgroundColor: colors.card,
          borderColor: "transparent",
        } as ViewStyle,
        text: { color: colors.primary, fontWeight: "800" } as TextStyle,
        spinner: colors.primary,
      };
    case "outline":
      return {
        container: {
          backgroundColor: "transparent",
          borderColor: "rgba(255, 255, 255, 0.35)",
        } as ViewStyle,
        text: { color: colors.textOnPrimary } as TextStyle,
        spinner: colors.textOnPrimary,
      };
    case "primary":
    default:
      return {
        container: {
          backgroundColor: colors.primary,
          borderColor: "transparent",
        } as ViewStyle,
        text: { color: colors.textOnPrimary } as TextStyle,
        spinner: colors.textOnPrimary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    marginTop: 14,
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.btn,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  label: {
    fontWeight: "700",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});
