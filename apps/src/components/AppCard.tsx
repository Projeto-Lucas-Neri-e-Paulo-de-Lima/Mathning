import { View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

type CardVariant = "default" | "tint" | "accent";

export function AppCard({
  children,
  style,
  variant = "default",
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
}) {
  const { layout, cardShadow } = useTheme();
  const variantStyle =
    variant === "tint"
      ? layout.cardTint
      : variant === "accent"
        ? layout.cardAccent
        : layout.card;

  return (
    <View style={[variantStyle, cardShadow, style]}>{children}</View>
  );
}
