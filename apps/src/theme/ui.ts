import { Platform, StyleSheet, type ViewStyle } from "react-native";
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
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
    },
    sectionEyebrow: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.primaryText,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 6,
    },
    pageSub: {
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
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 0,
    },
    muted: {
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
      color: colors.textOnPrimary,
      fontWeight: "700",
      fontSize: 16,
    },
  });
}

export type ThemeLayout = ReturnType<typeof createLayout>;
