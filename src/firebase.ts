import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

const app = initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
});
export const firestoreInstance = getFirestore(app);
export const authInstance = getAuth(app);
export const functionsInstance = getFunctions(app);