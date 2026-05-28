import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLayoutEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type AppHeaderOptions = {
  /** Botão claro sobre fundo roxo (ex.: Início). */
  variant?: "default" | "hero";
};

export function useAppHeader(navigation: Nav, options?: AppHeaderOptions) {
  const variant = options?.variant ?? "default";
  const isHero = variant === "hero";
  const { colors } = useTheme();

  useLayoutEffect(() => {
    const apply = () => {
      const canBack = navigation.canGoBack();
      navigation.setOptions({
        title: "",
        headerTitle: "",
        headerBackVisible: false,
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTintColor: colors.textOnPrimary,
        headerLeft: canBack
          ? () => (
              <HeaderBackButton
                isHero={isHero}
                colors={colors}
                onPress={() => navigation.goBack()}
              />
            )
          : undefined,
        headerRight: undefined,
      });
    };
    apply();
    return navigation.addListener("focus", apply);
  }, [navigation, colors, isHero]);
}

function HeaderBackButton({
  onPress,
  isHero,
  colors,
}: {
  onPress: () => void;
  isHero: boolean;
  colors: ColorTokens;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[
        headerStyles.backBtn,
        isHero ? headerStyles.backBtnHero : headerStyles.backBtnDefault,
        !isHero && { backgroundColor: colors.primary },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      accessibilityHint="Retorna à tela anterior"
    >
      <Ionicons name="chevron-back" size={22} color={colors.textOnPrimary} />
    </Pressable>
  );
}

const headerStyles = StyleSheet.create({
  backBtn: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  backBtnHero: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  backBtnDefault: {
    borderColor: "transparent",
  },
});
