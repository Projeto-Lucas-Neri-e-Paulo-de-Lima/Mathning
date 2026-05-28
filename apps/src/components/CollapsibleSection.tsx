import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { fontFamilies } from "../theme/typography";
import type { ColorTokens } from "../theme/tokens";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.head}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.muted}
        />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    wrap: { gap: 0 },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: 14,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    body: { marginTop: 8 },
  });
}
