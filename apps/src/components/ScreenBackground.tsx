import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function ScreenBackground({
  children,
  style,
  edgeToEdge,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Oculta blobs decorativos (ex.: hero roxo contínuo no Início). */
  edgeToEdge?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }, style]}>
      {!edgeToEdge ? (
        <>
          <View
            style={[
              styles.blob,
              styles.blobTopRight,
              { backgroundColor: colors.accentBlob },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blobMidLeft,
              { backgroundColor: colors.accentBlob },
            ]}
          />
          <View
            style={[
              styles.blobSoft,
              styles.blobBottom,
              { backgroundColor: colors.accentBlobSoft },
            ]}
          />
        </>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobSoft: {
    position: "absolute",
    borderRadius: 999,
  },
  blobTopRight: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  blobMidLeft: {
    width: 160,
    height: 160,
    top: "38%",
    left: -70,
  },
  blobBottom: {
    width: 280,
    height: 280,
    bottom: -120,
    right: -40,
  },
});
