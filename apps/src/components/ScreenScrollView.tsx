import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useBottomNavInset } from "../hooks/useBottomNavInset";
import { useScreenHeaderInset } from "../hooks/useScreenHeaderInset";

type ScreenScrollViewProps = ScrollViewProps & {
  /** Reserva espaço para a barra de abas inferior. */
  withBottomNav?: boolean;
  /** Estilos do contentContainer sem padding de header/nav. */
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenScrollView({
  contentContainerStyle,
  contentStyle,
  withBottomNav = false,
  ...props
}: ScreenScrollViewProps) {
  const { layout } = useTheme();
  const headerInset = useScreenHeaderInset();
  const bottomNavInset = useBottomNavInset();

  return (
    <ScrollView
      {...props}
      contentContainerStyle={[
        layout.scroll,
        { paddingTop: headerInset, paddingBottom: withBottomNav ? bottomNavInset : 32 },
        contentStyle,
        contentContainerStyle,
      ]}
    />
  );
}
