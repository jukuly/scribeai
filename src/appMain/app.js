import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { authInstance } from '../firebase';
import { PopUp } from "../popUp/popUp";
import { useAuthState } from "react-firebase-hooks/auth";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

export function App() {
  const [user] = useAuthState(authInstance);

  return (
    <Router>
      <Routes>
        <Route path="/main" element={user ? <AppMain /> : <SignIn />} />
        <Route path="/pop-up" element={<PopUp user={user}/>} />
      </Routes>
    </Router>
  );
}