/**
 * Plus Jakarta Sans — carregada em App.tsx via useFonts.
 * Use fontFamily (não fontWeight) nos estilos que referenciam estas famílias.
 */
export const fontFamilies = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

export type FontFamilyToken = (typeof fontFamilies)[keyof typeof fontFamilies];
