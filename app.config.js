const path = require("path");
const { load } = require("@expo/env");

// Monorepo: variáveis ficam em apps/.env mesmo ao rodar `expo start` na raiz.
load(path.join(__dirname, "apps"));

const appJson = require("./apps/app.json");

const firebaseExtra = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** @type {import("expo/config").ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      ...firebaseExtra,
    },
  },
};
