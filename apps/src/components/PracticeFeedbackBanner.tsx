import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../theme/radius";

type PracticeFeedbackBannerProps = {
  variant: "ok" | "bad";
  title: string;
  message?: string;
};

export function PracticeFeedbackBanner({
  variant,
  title,
  message,
}: PracticeFeedbackBannerProps) {
  const { colors } = useTheme();
  const isOk = variant === "ok";

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isOk ? colors.successBg : colors.errorBg,
          borderColor: isOk ? colors.success : colors.error,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isOk ? "checkmark-circle" : "close-circle"}
        size={26}
        color={isOk ? colors.success : colors.error}
      />
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.title,
            { color: isOk ? colors.successDark : colors.errorDark },
          ]}
        >
          {title}
        </Text>
        {message ? (
          <Text
            style={[
              styles.message,
              { color: isOk ? colors.successDark : colors.errorDark },
            ]}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});
