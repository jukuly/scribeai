import { AppDefault } from "./default/appDefault";
import { AppMinimized } from "./minimized/appMinimized";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<AppDefault />} />
        <Route path="/minimized" element={<AppMinimized />} />
        {/*<Route path="/pop-up" element={<PopUp />} />*/}
      </Routes>
    </Router>
  );
}