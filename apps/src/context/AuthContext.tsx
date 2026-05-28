import { createContext, useContext, type ReactNode } from "react";
import type { Firestore } from "firebase/firestore";
import type { ProfileAvatarId, UserProgressDoc } from "@mathning/shared";
import { useAuthAndProgress } from "../hooks/useAuthAndProgress";

export interface AuthContextValue {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  avatarId: ProfileAvatarId;
  progress: UserProgressDoc | null;
  loading: boolean;
  error: string | null;
  demo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  continueDemo: () => Promise<void>;
  refreshProgress: () => Promise<boolean>;
  updateLocalDemo: (next: UserProgressDoc) => Promise<void>;
  updateUserAvatar: (avatarId: ProfileAvatarId) => Promise<void>;
  db: Firestore | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthAndProgress();
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext dentro de AuthProvider");
  }
  return ctx;
}
