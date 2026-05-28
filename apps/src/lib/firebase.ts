import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from "@firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const { getReactNativePersistence } = require("@firebase/auth") as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const ENV_KEYS = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
] as const;

type FirebaseEnvKey = (typeof ENV_KEYS)[number];

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function readEnv(key: FirebaseEnvKey): string | undefined {
  const fromProcess = process.env[key];
  if (fromProcess?.trim()) return fromProcess.trim();

  const extra = Constants.expoConfig?.extra as
    | Partial<Record<FirebaseEnvKey, string>>
    | undefined;
  const fromExtra = extra?.[key];
  if (fromExtra?.trim()) return fromExtra.trim();

  return undefined;
}

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  const apiKey = readEnv("EXPO_PUBLIC_FIREBASE_API_KEY");
  const authDomain = readEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = readEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = readEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = readEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = readEnv("EXPO_PUBLIC_FIREBASE_APP_ID");

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebasePublicConfig() !== null;
}

export function getFirebaseApp(): FirebaseApp {
  const config = getFirebasePublicConfig();
  if (!config) {
    throw new Error(
      "Firebase nao configurado. Crie apps/.env (copie de .env.example) e reinicie com: npm run start:clear",
    );
  }
  if (!app) {
    app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        });
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    try {
      auth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
