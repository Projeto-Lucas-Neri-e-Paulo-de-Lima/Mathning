import { cloneElement, useId, type ReactElement } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

type AccessibleFieldProps = {
  label: string;
  hint?: string;
  labelStyle?: TextInputProps["style"];
  containerStyle?: ViewStyle;
  children: ReactElement<TextInputProps>;
};

/**
 * Associa rótulo visual ao input para leitores de tela (evita anunciar duas vezes).
 */
export function AccessibleField({
  label,
  hint,
  labelStyle,
  containerStyle,
  children,
}: AccessibleFieldProps) {
  const rawId = useId();
  const labelId = `field-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <View style={[styles.group, containerStyle]}>
      <Text
        nativeID={labelId}
        style={labelStyle}
        accessible={false}
        importantForAccessibility="no"
      >
        {label}
      </Text>
      {cloneElement<TextInputProps>(children, {
        accessibilityLabel: label,
        accessibilityHint: hint,
        ...(Platform.OS === "android"
          ? { accessibilityLabelledBy: labelId }
          : {}),
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {},
});
