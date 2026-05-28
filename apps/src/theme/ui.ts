import { Platform, StyleSheet, type ViewStyle } from "react-native";
import { fontFamilies } from "./typography";
import type { ColorTokens } from "./tokens";
import { radius } from "./colors";

export function createCardShadow(colors: ColorTokens): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 14,
    },
    android: { elevation: 5 },
    default: {},
  }) as ViewStyle;
}

export function createLayout(colors: ColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      padding: 20,
      paddingBottom: 32,
      gap: 16,
    },
    /** Conteúdo abaixo de um hero full-bleed (padding lateral + espaçamento entre blocos). */
    scrollBody: {
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 16,
    },
    scrollTight: {
      padding: 20,
      paddingBottom: 28,
      gap: 12,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.card,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardTint: {
      backgroundColor: colors.cardMuted,
      borderRadius: radius.card,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardAccent: {
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.card,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    heroBanner: {
      backgroundColor: colors.primary,
      borderRadius: radius.hero,
      padding: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.12)",
    },
    heroBlob: {
      position: "absolute",
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.heroBlob,
    },
    heroBlobSmall: {
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.heroBlobSmall,
    },
    sectionTitle: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 17,
      color: colors.text,
    },
    sectionEyebrow: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 11,
      color: colors.primaryText,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    pageTitle: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 26,
      color: colors.text,
      marginBottom: 6,
    },
    pageSub: {
      fontFamily: fontFamilies.regular,
      fontSize: 14,
      color: colors.muted,
      lineHeight: 20,
      marginBottom: 4,
    },
    cardHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    h2: {
      fontFamily: fontFamilies.bold,
      fontSize: 17,
      color: colors.text,
      marginBottom: 0,
    },
    muted: {
      fontFamily: fontFamilies.regular,
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    primaryBtn: {
      marginTop: 14,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: radius.btn,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    primaryBtnTxt: {
      fontFamily: fontFamilies.bold,
      color: colors.textOnPrimary,
      fontSize: 16,
    },
  });
}

export type ThemeLayout = ReturnType<typeof createLayout>;
