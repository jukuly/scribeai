import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyAz-EfV93h2lcf0skaX2Oxiak-6nAFvVXI",
  projectId: "scribeai",
  messagingSenderId: "169190213916",
  appId: "1:169190213916:web:e91f12d191b9a58380d2d9",
  measurementId: "G-GP35M1KJ6S"
});
export const firestoreInstance = getFirestore(app);
export const authInstance = getAuth(app);