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

  useEffect(() => {
    window.api.receive('render', (route: string) => setWin(route));
    const unsubAuth = onAuthStateChanged(authInstance, user => {
      setUser(user);
    });

    const unsubFirestore = onSnapshot(doc(firestoreInstance, `users/${user?.uid}`), doc => {
      setUserData(doc.data() as UserData);
    });
    
    return () => {
      window.api.removeListener('render');
      unsubAuth();
      unsubFirestore();
    }
  }, []);

  switch (win) {
    case 'main':
      return user ? <AppMain /> : <SignIn />;
    case 'pop-up':
      return <PopUp user={user} userData={userData} />;
    default:
      return <div>No route</div>;
  }
}