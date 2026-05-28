import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "./ProfileAvatar";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTrailTabBadge } from "../hooks/useTrailTabBadge";
import { fontFamilies } from "../theme/typography";
import type { RootStackParamList } from "../navigation/types";

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
  const { colors, radius } = useTheme();
  const { show: trailBadge, count: trailOpenCount } = useTrailTabBadge();
  const styles = createStyles(colors, radius);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((item) => {
        const active = route === item.key;
        const showTrailDot =
          item.key === "LearningPath" && trailBadge && !active;
        const trailA11y =
          item.key === "LearningPath" && trailOpenCount > 0
            ? `${item.label}, ${trailOpenCount} ${
                trailOpenCount === 1 ? "lição em aberto" : "lições em aberto"
              }`
            : item.label;
        const tabHint =
          item.key === "Dashboard"
            ? "Ver seu início e progresso"
            : item.key === "Teoria"
              ? "Biblioteca de conteúdo para estudar"
              : item.key === "LearningPath"
                ? "Ver fases e lições em ordem"
                : "Configurações da conta e aparência";

        return (
          <Pressable
            key={item.key}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => navigation.navigate(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={trailA11y}
            accessibilityHint={active ? undefined : tabHint}
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
              <View style={styles.iconWrap}>
                <Ionicons
                  name={active ? item.iconActive : item.icon}
                  size={23}
                  color={active ? colors.navBarActive : colors.navBarInactive}
                />
                {showTrailDot ? (
                  <View
                    style={[
                      styles.badge,
                      trailOpenCount > 1 && styles.badgeWide,
                    ]}
                    accessibilityElementsHidden
                  >
                    {trailOpenCount > 1 ? (
                      <Text style={styles.badgeTxt}>
                        {trailOpenCount > 9 ? "9+" : trailOpenCount}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
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

function createStyles(
  colors: ReturnType<typeof useTheme>["colors"],
  radius: ReturnType<typeof useTheme>["radius"],
) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "row",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.navBarBorder,
      paddingTop: 8,
      paddingHorizontal: 4,
      backgroundColor: colors.navBar,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        android: { elevation: 12 },
        default: {},
      }),
    },
    btn: {
      flex: 1,
      minWidth: 0,
      minHeight: 48,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
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
    iconWrap: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -4,
      minWidth: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.streak,
      borderWidth: 1.5,
      borderColor: colors.navBar,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    badgeWide: {
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      top: -4,
      right: -8,
    },
    badgeTxt: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 9,
      color: "#fff",
      lineHeight: 11,
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
}
