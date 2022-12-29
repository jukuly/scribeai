import { SignIn } from "../signIn/signIn";
import { useAuthState } from "react-firebase-hooks/auth";
import { authInstance } from "../../firebase";
import './appDefault.scss';

export function AppDefault() {
  const [user] = useAuthState(authInstance);

  window.api.getConfig().then(config => {
    if (user) window.api.minimize();
  });

  return (
    user ? 
    <div className="app">
    </div> 
    : <SignIn />
  );
}