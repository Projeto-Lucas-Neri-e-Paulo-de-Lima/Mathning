import { useMemo } from "react";
import { useTheme, type ThemeContextValue } from "../context/ThemeContext";

export function useThemedStyles<T>(
  factory: (theme: ThemeContextValue) => T,
): T {
  const theme = useTheme();
  return useMemo(
    () => factory(theme),
    [theme, theme.mode, theme.resolvedMode, theme.colors, theme.layout, theme.cardShadow],
  );
}
