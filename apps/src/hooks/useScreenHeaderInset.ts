import { getDefaultHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Espaço no topo para não sobrepor status bar / botão voltar.
 * Abas sem voltar: só safe area; telas empilhadas: altura do header nativo.
 */
export function useScreenHeaderInset(extra = 8): number {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  if (!navigation.canGoBack()) {
    return insets.top + extra;
  }

  return getDefaultHeaderHeight({ width, height }, false, insets.top) + extra;
}
