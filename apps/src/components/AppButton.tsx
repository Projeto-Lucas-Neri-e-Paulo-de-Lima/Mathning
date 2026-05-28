import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { triggerLightImpact } from "../lib/appHaptics";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";
import { fontFamilies } from "../theme/typography";
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
  accessibilityHint?: string;
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
  accessibilityHint,
}: AppButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const palette = getVariantStyles(colors, variant);
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  function animateScale(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 55,
      bounciness: 4,
    }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        if (!isDisabled) {
          if (!reduceMotion) animateScale(0.97);
          void triggerLightImpact();
        }
      }}
      onPressOut={() => animateScale(1)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <Animated.View
        style={[
          styles.base,
          palette.container,
          isDisabled && styles.disabled,
          style,
          { transform: [{ scale }] },
        ]}
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
      </Animated.View>
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
        text: { color: colors.primary, fontFamily: fontFamilies.extraBold } as TextStyle,
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
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.55,
  },
});
