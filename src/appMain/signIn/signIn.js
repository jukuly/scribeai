import './signIn.scss';
import { authInstance } from '../../firebase';
import * as auth from "firebase/auth";
import { useState } from 'react';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function signUp() {
    //TODO open the sign up page on website
  }

  function signIn() {
    auth.signInWithEmailAndPassword(authInstance, email, password);
  }

  return (
    <div className='sign-in'>
      <div className='middle-box'>
        <input className='email' type='text' placeholder='Email' value={email} onChange={(event) => setEmail(event.target.value)}></input>
        <input className='password' type='password' placeholder='Password' value={password} onChange={(event) => setPassword(event.target.value)}></input>
        <button onClick={() => signIn()}>Sign In</button>
        <span className='sign-up'>No account yet? <span className='underlined' onClick={() => signUp()}>Sign up</span> instead</span>
      </div>
    </div>
  );
}