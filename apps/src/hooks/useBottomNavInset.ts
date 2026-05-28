import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Altura fixa da barra de abas (sem safe area inferior). */
export const BOTTOM_NAV_CONTENT_HEIGHT = 58;

/** Espaço para o último conteúdo não ficar atrás da bottom nav. */
export function useBottomNavInset(scrollExtra = 16): number {
  const insets = useSafeAreaInsets();
  const bottomSafe = Math.max(insets.bottom, 10);
  return BOTTOM_NAV_CONTENT_HEIGHT + bottomSafe + scrollExtra;
}
