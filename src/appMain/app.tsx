import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { authInstance } from '../firebase';
import { PopUp } from "../popUp/popUp";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect, useState } from "react";

//Component
export function App() {
  const [user] = useAuthState(authInstance);
  const [win, setWin] = useState<string>('');

  useEffect(() => window.api.receive('render', (route: string) => setWin(route)), []);

  switch (win) {
    case 'main':
      return user ? <AppMain /> : <SignIn />;
    case 'pop-up':
      return <PopUp />;
    default:
      return <div>No route</div>;
  }
}