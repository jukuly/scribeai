import * as auth from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { authInstance } from '../../firebase';
import './appMain.scss';

export function AppMain() {
  const navigate = useNavigate();
  
  auth.onAuthStateChanged(authInstance, (user) => {
    if (!user) {
      navigate('/sign-in');
    }
  });

  function signOut() {
    authInstance.signOut();
  }

  return (
    <div className="app">
      <button onClick={() => signOut()}>Sign out</button>
    </div> 
  );
}