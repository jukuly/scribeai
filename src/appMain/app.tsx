import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { authInstance } from '../firebase';
import { PopUp } from "../popUp/popUp";
import { useAuthState } from "react-firebase-hooks/auth";
import { Route, HashRouter, Routes } from "react-router-dom";
import React, { useState } from "react";

export function App() {
  const [user] = useAuthState(authInstance);
  const [win, setWin] = useState<string>('');

  window.api.receive('render', (route: string) => setWin(route));

  switch (win) {
    case 'main':
      return user ? <AppMain /> : <SignIn />;
    case 'pop-up':
      return <PopUp />;
    default:
      return <div>No route</div>;
  }
  /*return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<div>No route</div>} />
        <Route path="/main" element={user ? <AppMain /> : <SignIn />} />
        <Route path="/pop-up" element={<PopUp />} />
      </Routes>
    </HashRouter>
  );*/
}