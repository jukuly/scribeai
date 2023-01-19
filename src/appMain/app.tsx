import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { authInstance } from '../firebase';
import { PopUp } from "../popUp/popUp";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { firestoreInstance } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

//Component
export function App() {
  const [win, setWin] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userDataReadOnly, setUserDataReadOnly] = useState<UserDataReadOnly | null>(null);

  useEffect(() => {
    window.api.receive('render', (route: string) => setWin(route));
    const unsubAuth = onAuthStateChanged(authInstance, user => {
      setUser(user);
    });

    const unsubFirestoreUserDataRO = onSnapshot(doc(firestoreInstance, `user-data-private/${user?.uid}`), doc => {
      setUserDataReadOnly(doc.data() as UserDataReadOnly);
    });

    const unsubFirestoreUserData = onSnapshot(doc(firestoreInstance, `user-data-public/${user?.uid}`), doc => {
      setUserData(doc.data() as UserData);
    });
    
    return () => {
      window.api.removeListener('render');
      unsubAuth();
      unsubFirestoreUserDataRO();
      unsubFirestoreUserData();
    }
  }, []);

  switch (win) {
    case 'main':
      return user ? <AppMain /> : <SignIn />;
    case 'pop-up':
      return <PopUp user={user} userDataReadOnly={userDataReadOnly} />;
    default:
      return <div>No route</div>;
  }
}