import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "./ProfileAvatar";
import { useAuthContext } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme/colors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TabKey = keyof Pick<
  RootStackParamList,
  "Dashboard" | "LearningPath" | "Teoria" | "Profile"
>;

type TabItem =
  | {
      key: Exclude<TabKey, "Profile">;
      label: string;
      kind: "icon";
      icon: React.ComponentProps<typeof Ionicons>["name"];
      iconActive: React.ComponentProps<typeof Ionicons>["name"];
    }
  | {
      key: "Profile";
      label: string;
      kind: "profile";
    };

const TABS: TabItem[] = [
  { key: "Dashboard", label: "Início", kind: "icon", icon: "home-outline", iconActive: "home" },
  {
    key: "Teoria",
    label: "Teoria",
    kind: "icon",
    icon: "document-text-outline",
    iconActive: "document-text",
  },
  { key: "LearningPath", label: "Trilha", kind: "icon", icon: "book-outline", iconActive: "book" },
  { key: "Profile", label: "Perfil", kind: "profile" },
];

const PROFILE_TAB_SIZE = 26;

export function BottomNav({
  navigation,
  route,
}: {
  navigation: Nav;
  route: TabKey;
}) {
  const insets = useSafeAreaInsets();
  const { avatarId } = useAuthContext();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((item) => {
        const active = route === item.key;
        return (
          <Pressable
            key={item.key}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => navigation.navigate(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
          >
            {item.kind === "profile" ? (
              <View style={[styles.profileIcon, !active && styles.profileIconInactive]}>
                <ProfileAvatar
                  avatarId={avatarId}
                  size={PROFILE_TAB_SIZE}
                  variant={active ? "onPrimary" : "onPrimaryMuted"}
                />
              </View>
            ) : (
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={23}
                color={active ? colors.navBarActive : colors.navBarInactive}
              />
            )}
            <Text style={[styles.txt, active && styles.txtActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.navBarBorder,
    paddingTop: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.navBar,
  },
  btn: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    alignItems: "center",
    gap: 3,
    borderRadius: radius.sm,
    marginHorizontal: 1,
  },
  btnActive: {
    backgroundColor: colors.navBarActiveBg,
  },
  profileIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconInactive: {
    opacity: 0.82,
  },
  txt: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.navBarInactive,
  },
  txtActive: {
    color: colors.navBarActive,
    fontWeight: "800",
  },
});
