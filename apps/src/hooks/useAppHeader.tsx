import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLayoutEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useAuthContext } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type AppHeaderOptions = {
  /** Exibe o botão de perfil no canto superior direito (padrão: true). */
  showProfileButton?: boolean;
};

export function useAppHeader(
  navigation: Nav,
  title: string,
  options?: AppHeaderOptions,
) {
  const showProfile = options?.showProfileButton !== false;
  const { avatarId } = useAuthContext();

  useLayoutEffect(() => {
    const apply = () => {
      const canBack = navigation.canGoBack();
      navigation.setOptions({
        title,
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#1A1A22",
        headerShadowVisible: true,
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "700", fontSize: 17, color: "#1A1A22" },
        headerLeft: canBack
          ? () => (
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={12}
                style={{ marginLeft: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Ionicons name="arrow-back" size={24} color="#1A1A22" />
              </Pressable>
            )
          : () => null,
        headerRight: showProfile
          ? () => (
              <Pressable
                onPress={() => navigation.navigate("Profile")}
                hitSlop={12}
                style={headerStyles.profileBtn}
                accessibilityRole="button"
                accessibilityLabel="Perfil"
              >
                <ProfileAvatar avatarId={avatarId} size={34} variant="header" />
              </Pressable>
            )
          : () => null,
      });
    };
    apply();
    return navigation.addListener("focus", apply);
  }, [navigation, title, showProfile, avatarId]);
}

const headerStyles = StyleSheet.create({
  profileBtn: {
    marginRight: 8,
    padding: 3,
    borderRadius: 999,
    backgroundColor: colors.primaryMuted,
  },
});
