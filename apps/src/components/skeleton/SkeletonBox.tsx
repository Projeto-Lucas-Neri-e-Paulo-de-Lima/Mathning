import { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { radius } from "../../theme/radius";

type SkeletonVariant = "default" | "onPrimary";

type SkeletonBoxProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  variant?: SkeletonVariant;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBox({
  width = "100%",
  height,
  borderRadius = radius.sm,
  variant = "default",
  style,
}: SkeletonBoxProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 0.72 : 0.5)).current;
  const backgroundColor =
    variant === "onPrimary" ? "rgba(255, 255, 255, 0.28)" : colors.border;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.72);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.95,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

type SkeletonCircleProps = {
  size: number;
  variant?: SkeletonVariant;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonCircle({
  size,
  variant = "default",
  style,
}: SkeletonCircleProps) {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius={size / 2}
      variant={variant}
      style={style}
    />
  );
}
