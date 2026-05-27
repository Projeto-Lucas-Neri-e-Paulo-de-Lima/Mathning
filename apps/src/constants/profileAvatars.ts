import type { ImageSourcePropType } from "react-native";
import type { ProfileAvatarId } from "@mathning/shared";

export type ProfileAvatarOption = {
  id: ProfileAvatarId;
  label: string;
  source: ImageSourcePropType;
  /** Fundo suave harmonizado com a cor do mascote */
  backgroundColor: string;
};

export const PROFILE_AVATAR_OPTIONS: ProfileAvatarOption[] = [
  {
    id: "purple",
    label: "Roxo",
    source: require("../../assets/avatars/mascot-purple.png"),
    backgroundColor: "#EDE7F6",
  },
  {
    id: "blue",
    label: "Azul",
    source: require("../../assets/avatars/mascot-blue.png"),
    backgroundColor: "#DBEAFE",
  },
  {
    id: "green",
    label: "Verde",
    source: require("../../assets/avatars/mascot-green.png"),
    backgroundColor: "#D1FAE5",
  },
  {
    id: "orange",
    label: "Laranja",
    source: require("../../assets/avatars/mascot-orange.png"),
    backgroundColor: "#FFEDD5",
  },
  {
    id: "pink",
    label: "Rosa",
    source: require("../../assets/avatars/mascot-pink.png"),
    backgroundColor: "#FCE7F3",
  },
  {
    id: "teal",
    label: "Turquesa",
    source: require("../../assets/avatars/mascot-teal.png"),
    backgroundColor: "#CCFBF1",
  },
];

const byId = Object.fromEntries(
  PROFILE_AVATAR_OPTIONS.map((o) => [o.id, o]),
) as Record<ProfileAvatarId, ProfileAvatarOption>;

export function getProfileAvatarOption(id: ProfileAvatarId): ProfileAvatarOption {
  return byId[id] ?? byId.purple;
}
