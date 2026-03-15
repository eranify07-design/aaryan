import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCcB8A3Z3jOguXzGWBxhBtGx_2_njxACP8",
  authDomain: "dev-aaryan-s-billing-app.firebaseapp.com",
  projectId: "dev-aaryan-s-billing-app",
  storageBucket: "dev-aaryan-s-billing-app.firebasestorage.app",
  messagingSenderId: "7646596283",
  appId: "1:7646596283:android:d74d56eaa3b663c2c1ed9e",
};

const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

let auth: ReturnType<typeof getAuth>;
if (Platform.OS !== "web" && isFirstInit) {
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
