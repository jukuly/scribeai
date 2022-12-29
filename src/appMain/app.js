import { AppDefault } from "./default/appDefault";
import { AppMinimized } from "./minimized/appMinimized";
import { SignIn } from "./signIn/signIn";
import { useAuthState } from "react-firebase-hooks/auth";
import { authInstance } from "../firebase";

export function App() {
  const minimized = false;
  const [user] = useAuthState(authInstance);
  
  return user ? minimized ? 
    <AppMinimized />
    : <AppDefault />
    : <SignIn />
}