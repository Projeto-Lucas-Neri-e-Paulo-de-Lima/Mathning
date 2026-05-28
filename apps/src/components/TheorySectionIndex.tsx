import { ScrollView, StyleSheet, Text, Pressable } from "react-native";
import type { TheorySectionLink } from "../context/TheoryReaderContext";
import { useTheme } from "../context/ThemeContext";
import { fontFamilies } from "../theme/typography";
import { radius } from "../theme/radius";
import type { ColorTokens } from "../theme/tokens";

type TheorySectionIndexProps = {
  sections: TheorySectionLink[];
  onSelect: (id: string) => void;
};

export function TheorySectionIndex({ sections, onSelect }: TheorySectionIndexProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (sections.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="list"
      accessibilityLabel="Índice do conteúdo"
    >
      {sections.map((section) => (
        <Pressable
          key={section.id}
          style={styles.chip}
          onPress={() => onSelect(section.id)}
          accessibilityRole="button"
          accessibilityLabel={`Ir para ${section.title}`}
        >
          <Text style={styles.chipTxt} numberOfLines={1}>
            {section.title}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    row: {
      gap: 8,
      paddingVertical: 4,
    },
    chip: {
      minHeight: 36,
      maxWidth: 200,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      justifyContent: "center",
    },
    chipTxt: {
      fontFamily: fontFamilies.semiBold,
      fontSize: 12,
      color: colors.primaryText,
    },
  });
}
