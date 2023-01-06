import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { authInstance } from '../firebase';
import { PopUp } from "../popUp/popUp";
import { Loading } from "../loading/loading";
import { useAuthState } from "react-firebase-hooks/auth";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import React from "react";

export function App() {
  const [user] = useAuthState(authInstance);

  return (
    <Router>
      <Routes>
        <Route path="/main" element={user ? <AppMain /> : <SignIn />} />
        <Route path="/pop-up" element={<PopUp />} />
        <Route path="/pop-up-loading" element={<Loading />} />
      </Routes>
    </Router>
  );
}