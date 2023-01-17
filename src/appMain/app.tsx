import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { authInstance } from '../firebase';
import { PopUp } from "../popUp/popUp";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

//Component
export function App() {
  const [win, setWin] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    window.api.receive('render', (route: string) => setWin(route));
    const unsub = onAuthStateChanged(authInstance, user => {
      setUser(user);
    });
    
    return () => {
      window.api.removeListener('render');
      unsub()
    }
  }, []);

  switch (win) {
    case 'main':
      return user ? <AppMain /> : <SignIn />;
    case 'pop-up':
      return <PopUp user={user} />;
    default:
      return <div>No route</div>;
  }
}