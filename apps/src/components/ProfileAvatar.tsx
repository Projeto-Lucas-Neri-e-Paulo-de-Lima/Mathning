import {
  DEFAULT_PROFILE_AVATAR_ID,
  normalizeProfileAvatarId,
  type ProfileAvatarId,
} from "@mathning/shared";
import { Image, StyleSheet, View, type ViewStyle } from "react-native";
import { getProfileAvatarOption } from "../constants/profileAvatars";
import { useTheme } from "../context/ThemeContext";

type ProfileAvatarVariant = "default" | "onPrimary" | "onPrimaryMuted" | "header";

export function ProfileAvatar({
  avatarId,
  size = 72,
  variant = "default",
  style,
}: {
  avatarId?: ProfileAvatarId | string | null;
  size?: number;
  variant?: ProfileAvatarVariant;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const id = normalizeProfileAvatarId(avatarId ?? DEFAULT_PROFILE_AVATAR_ID);
  const option = getProfileAvatarOption(id);

  const borderByVariant: Record<
    ProfileAvatarVariant,
    { color: string; widthScale: number }
  > = {
    default: { color: colors.border, widthScale: 0.04 },
    onPrimary: { color: "#FFFFFF", widthScale: 0.1 },
    onPrimaryMuted: { color: "rgba(255, 255, 255, 0.55)", widthScale: 0.08 },
    header: { color: colors.primary, widthScale: 0.08 },
  };

  const { color: borderColor, widthScale } = borderByVariant[variant];
  const border = Math.max(2, Math.round(size * widthScale));

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: border,
          borderColor,
          backgroundColor: option.backgroundColor,
        },
        style,
      ]}
    >
      <Image
        source={option.source}
        style={{
          width: size - border * 2,
          height: size - border * 2,
          borderRadius: (size - border * 2) / 2,
        }}
        resizeMode="cover"
        accessibilityLabel={`Avatar ${option.label}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
