import * as auth from "firebase/auth";
import { authInstance } from '../../firebase';
import './appMain.scss';

export function AppMain() {

  function signOut() {
    authInstance.signOut();
  }

  auth.onAuthStateChanged(authInstance, async (user) => {
    if (!user) {
      await window.api.signOut();
    }
  });

  return (
    <div className="app">
      <button onClick={() => signOut()}>Sign out</button>
    </div> 
  );
}