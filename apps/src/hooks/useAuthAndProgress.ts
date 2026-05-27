import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "@firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { UserProgressDoc } from "@mathning/shared";
import {
  ensureUserProgress,
  normalizeProfileAvatarId,
  setUserAvatar,
  touchDailyStreak,
  type ProfileAvatarId,
} from "@mathning/shared";
import { getDb, getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";
import { loadDemoProgress, saveDemoProgress } from "../lib/demoStorage";

function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Este email ja esta cadastrado.";
    case "auth/invalid-email":
      return "Digite um email valido.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email ou senha incorretos.";
    case "auth/weak-password":
      return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/network-request-failed":
      return "Sem conexao com o Firebase. Verifique sua internet.";
    case "auth/operation-not-allowed":
      return "Ative o login por email/senha no Firebase Authentication.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    default:
      return error instanceof Error ? error.message : "Falha na autenticacao.";
  }
}

function progressErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "permission-denied") {
    return "Nao foi possivel acessar seu progresso. Confira as regras do Firestore para permitir users/{uid}.";
  }

  return error instanceof Error ? error.message : "Erro ao carregar progresso";
}

export function useAuthAndProgress() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [authDisplayName, setAuthDisplayName] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgressDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const demo = !isFirebaseConfigured();

  const db = useMemo<Firestore | null>(() => {
    if (demo) return null;
    return getDb() as Firestore;
  }, [demo]);

  const refreshProgress = useCallback(async () => {
    if (demo) {
      setProgress(await loadDemoProgress());
      return;
    }
    if (!uid || !db) return;
    try {
      await ensureUserProgress(db, uid);
      await touchDailyStreak(db, uid);
      setProgress(await ensureUserProgress(db, uid));
    } catch (e) {
      setProgress(null);
      setError(progressErrorMessage(e));
    }
  }, [demo, uid, db]);

  useEffect(() => {
    if (demo) {
      setUid(null);
      setProgress(null);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setError(null);
      if (!user) {
        setUid(null);
        setEmail(null);
        setAuthDisplayName(null);
        setProgress(null);
        setLoading(false);
        return;
      }

      setUid(user.uid);
      setEmail(user.email ?? null);
      setAuthDisplayName(user.displayName ?? null);
      setLoading(true);
      try {
        const database = getDb() as Firestore;
        await ensureUserProgress(database, user.uid);
        await touchDailyStreak(database, user.uid);
        const p = await ensureUserProgress(database, user.uid);
        setProgress(p);
      } catch (e) {
        setProgress(null);
        setError(progressErrorMessage(e));
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [demo]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (demo) {
        throw new Error("Configure o Firebase para entrar com email e senha.");
      }
      try {
        setError(null);
        await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        );
      } catch (e) {
        throw new Error(authErrorMessage(e));
      }
    },
    [demo],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (demo) {
        throw new Error("Configure o Firebase para criar contas.");
      }
      const trimmedName = displayName.trim();
      if (trimmedName.length < 2) {
        throw new Error("Digite seu nome (mínimo 2 caracteres).");
      }
      if (trimmedName.length > 60) {
        throw new Error("O nome pode ter no máximo 60 caracteres.");
      }
      try {
        setError(null);
        const cred = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        );
        await updateProfile(cred.user, { displayName: trimmedName });
        const database = getDb() as Firestore;
        const p = await ensureUserProgress(database, cred.user.uid, {
          displayName: trimmedName,
        });
        setAuthDisplayName(trimmedName);
        setProgress(p);
      } catch (e) {
        throw new Error(authErrorMessage(e));
      }
    },
    [demo],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (demo) {
        throw new Error("Configure o Firebase para recuperar senha.");
      }
      try {
        setError(null);
        await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      } catch (e) {
        throw new Error(authErrorMessage(e));
      }
    },
    [demo],
  );

  const signOutUser = useCallback(async () => {
    if (demo) {
      setUid(null);
      setEmail(null);
      setAuthDisplayName(null);
      setProgress(null);
      return;
    }
    await signOut(getFirebaseAuth());
    setUid(null);
    setEmail(null);
    setAuthDisplayName(null);
    setProgress(null);
  }, [demo]);

  const continueDemo = useCallback(async () => {
    setUid("demo");
    setEmail(null);
    setAuthDisplayName(null);
    setProgress(await loadDemoProgress());
    setLoading(false);
  }, []);

  const updateLocalDemo = useCallback(async (next: UserProgressDoc) => {
    await saveDemoProgress(next);
    setProgress(next);
  }, []);

  const updateUserAvatar = useCallback(
    async (avatarId: ProfileAvatarId) => {
      if (!progress) return;
      const next: UserProgressDoc = { ...progress, avatarId };
      if (demo) {
        await updateLocalDemo(next);
        return;
      }
      if (!uid || !db) return;
      await setUserAvatar(db, uid, avatarId);
      setProgress(next);
    },
    [progress, demo, uid, db, updateLocalDemo],
  );

  const displayName =
    progress?.displayName?.trim() || authDisplayName?.trim() || null;

  const avatarId = normalizeProfileAvatarId(progress?.avatarId);

  return {
    uid,
    email,
    displayName,
    avatarId,
    progress,
    loading,
    error,
    demo,
    signIn,
    signUp,
    resetPassword,
    signOutUser,
    continueDemo,
    refreshProgress,
    updateLocalDemo,
    updateUserAvatar,
    db,
  };
}
