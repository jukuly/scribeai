import { AppMain } from "./main/appMain";
import { SignIn } from "./signIn/signIn";
import { PopUp } from "../popUp/popUp";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<AppMain />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/pop-up" element={<PopUp />} />
      </Routes>
    </Router>
  );
}