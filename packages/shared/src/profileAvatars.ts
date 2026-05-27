export const PROFILE_AVATAR_IDS = [
  "purple",
  "blue",
  "green",
  "orange",
  "pink",
  "teal",
] as const;

export type ProfileAvatarId = (typeof PROFILE_AVATAR_IDS)[number];

export const DEFAULT_PROFILE_AVATAR_ID: ProfileAvatarId = "purple";

export function normalizeProfileAvatarId(
  value: string | undefined | null,
): ProfileAvatarId {
  if (value && PROFILE_AVATAR_IDS.includes(value as ProfileAvatarId)) {
    return value as ProfileAvatarId;
  }
  return DEFAULT_PROFILE_AVATAR_ID;
}
