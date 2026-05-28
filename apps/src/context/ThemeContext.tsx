import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { getThemeColors } from "../theme/palettes";
import { radius } from "../theme/radius";
import type { ColorTokens, ResolvedThemeMode, ThemeMode } from "../theme/tokens";
import { createCardShadow, createLayout, type ThemeLayout } from "../theme/ui";
import { loadStoredThemeMode, saveThemeMode } from "../lib/themeStorage";

export type ThemeContextValue = {
  /** Preferência do usuário (inclui "system"). */
  mode: ThemeMode;
  /** Tema efetivo após resolver o sistema. */
  resolvedMode: ResolvedThemeMode;
  isDark: boolean;
  colors: ColorTokens;
  layout: ThemeLayout;
  cardShadow: ReturnType<typeof createCardShadow>;
  radius: typeof radius;
  setMode: (mode: ThemeMode) => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(
  preference: ThemeMode,
  systemScheme: "light" | "dark" | null | undefined,
): ResolvedThemeMode {
  if (preference === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await loadStoredThemeMode();
      if (stored) {
        setModeState(stored);
      }
      setReady(true);
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void saveThemeMode(next);
  }, []);

  const resolvedMode = useMemo(
    () => resolveMode(mode, systemScheme),
    [mode, systemScheme],
  );

  const colors = useMemo(() => getThemeColors(resolvedMode), [resolvedMode]);
  const layout = useMemo(() => createLayout(colors), [colors]);
  const cardShadow = useMemo(() => createCardShadow(colors), [colors]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      isDark: resolvedMode === "dark",
      colors,
      layout,
      cardShadow,
      radius,
      setMode,
      ready,
    }),
    [mode, resolvedMode, colors, layout, cardShadow, setMode, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return ctx;
}

/** Sobrescreve o tema efetivo em uma subárvore (ex.: login sempre claro). */
export function ForceThemeScope({
  mode,
  children,
}: {
  mode: ResolvedThemeMode;
  children: ReactNode;
}) {
  const parent = useTheme();
  const colors = useMemo(() => getThemeColors(mode), [mode]);
  const layout = useMemo(() => createLayout(colors), [colors]);
  const cardShadow = useMemo(() => createCardShadow(colors), [colors]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...parent,
      resolvedMode: mode,
      isDark: mode === "dark",
      colors,
      layout,
      cardShadow,
    }),
    [parent, mode, colors, layout, cardShadow],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
