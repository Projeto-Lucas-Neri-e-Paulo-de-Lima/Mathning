import { PixelRatio } from "react-native";

/** Limite para não quebrar cards com texto muito grande do sistema. */
export const MAX_FONT_SCALE = 1.35;

export function getFontScale(): number {
  return Math.min(PixelRatio.getFontScale(), MAX_FONT_SCALE);
}

export function scaleFont(size: number): number {
  return Math.round(size * getFontScale());
}
