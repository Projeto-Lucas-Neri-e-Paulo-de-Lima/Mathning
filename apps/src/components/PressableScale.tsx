import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { triggerLightImpact } from "../lib/appHaptics";

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Dispara haptic leve ao toque (padrão: true). */
  haptic?: boolean;
  pressedScale?: number;
};

export function PressableScale({
  children,
  style,
  disabled,
  haptic = true,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 55,
      bounciness: 4,
    }).start();
  }

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) {
          animateTo(pressedScale);
          if (haptic) void triggerLightImpact();
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
