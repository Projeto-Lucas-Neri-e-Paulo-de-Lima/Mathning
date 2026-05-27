import type { ProfileAvatarId } from "@mathning/shared";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PROFILE_AVATAR_OPTIONS } from "../constants/profileAvatars";
import { colors, radius } from "../theme/colors";

export function AvatarPickerModal({
  visible,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedId: ProfileAvatarId;
  onSelect: (id: ProfileAvatarId) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Escolha sua foto de perfil</Text>
          <Text style={styles.sub}>
            Mascote Mathning em várias cores — o roxo é o padrão da marca.
          </Text>
          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {PROFILE_AVATAR_OPTIONS.map((opt) => {
              const selected = opt.id === selectedId;
              return (
                <Pressable
                  key={opt.id}
                  style={[styles.item, selected && styles.itemSelected]}
                  onPress={() => onSelect(opt.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Avatar ${opt.label}`}
                  accessibilityState={{ selected }}
                >
                  <Image
                    source={opt.source}
                    style={[styles.thumb, { backgroundColor: opt.backgroundColor }]}
                    resizeMode="cover"
                  />
                  <Text style={[styles.label, selected && styles.labelSelected]}>
                    {opt.label}
                  </Text>
                  {selected ? (
                    <View style={styles.check}>
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnTxt}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    maxHeight: "85%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.muted, lineHeight: 18, marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingBottom: 8,
  },
  item: {
    width: "30%",
    minWidth: 96,
    maxWidth: 110,
    alignItems: "center",
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  label: { fontSize: 12, fontWeight: "600", color: colors.muted },
  labelSelected: { color: colors.primaryText, fontWeight: "800" },
  check: { position: "absolute", top: 6, right: 6 },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: radius.btn,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  closeBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
