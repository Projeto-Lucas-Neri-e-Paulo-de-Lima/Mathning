import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { ThemeMode } from "../theme/tokens";
import { AppCard } from "./AppCard";

const MODE_OPTIONS: {
  id: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "light", label: "Claro", icon: "sunny-outline" },
  { id: "dark", label: "Escuro", icon: "moon-outline" },
  { id: "system", label: "Sistema", icon: "phone-portrait-outline" },
];

export function ThemeSettingsCard() {
  const { colors, mode, resolvedMode, setMode } = useTheme();
  const styles = createStyles(colors);

  return (
    <AppCard>
      <View style={styles.head}>
        <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
        <Text style={styles.title}>Aparência</Text>
      </View>

      <Text style={styles.label}>Tema</Text>
      <View style={styles.col}>
        {MODE_OPTIONS.map((opt) => {
          const active = mode === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setMode(opt.id)}
              style={[styles.row, active && styles.rowActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <View style={styles.rowIcon}>
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={active ? colors.primary : colors.muted}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                  {opt.label}
                </Text>
                {opt.id === "system" ? (
                  <Text style={styles.rowHint}>
                    Usando {resolvedMode === "dark" ? "escuro" : "claro"} do dispositivo
                  </Text>
                ) : null}
              </View>
              {active ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              ) : (
                <View style={styles.radio} />
              )}
            </Pressable>
          );
        })}
      </View>
    </AppCard>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    head: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    title: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    col: { gap: 8 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardMuted,
    },
    rowActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },
    rowText: { flex: 1 },
    rowLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    rowLabelActive: {
      color: colors.primaryText,
    },
    rowHint: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
      lineHeight: 17,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
    },
  });
}
