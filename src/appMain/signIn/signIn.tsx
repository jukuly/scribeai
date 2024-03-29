import './signIn.scss';
import { authInstance } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import React from 'react';

//Component
export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function signIn(): void {
    signInWithEmailAndPassword(authInstance, email, password)
      .then(() => setError(''))
      .catch(err => {
        if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found'
          || err.code === 'auth/wrong-password' || password === '') {
          setError('E-mail or password is incorrect');
        } else if (err.code === 'auth/user-disabled') {
          setError('This user is suspended');
        } else {
          setError(err.code);
        }
        setPassword('');
      });
  }

  return (
    <div className='sign-in'>
      <div className='middle-box'>
        <form onSubmit={event => {
            event.preventDefault();
            signIn();
          }}>
          <input className='email' type='text' placeholder='Email' value={email} onChange={event => setEmail(event.target.value)}></input>
          <input className='password' type='password' placeholder='Password' value={password} onChange={event => setPassword(event.target.value)}></input>
          <div className='below-fields'>
            <span>{ error }</span>
            <button className='sign-in-button' type='submit'>Sign In</button>
          </div>
        </form>
        <span className='sign-up'>No account yet? <span className='underlined' onClick={() => window.api.openInBrowser('https://www.scribeai.net/sign-up')}>Sign up</span> instead</span>
        <span className='forgot'><span className='underlined' onClick={() => window.api.openInBrowser('https://www.scribeai.net/forgot-password')}>I forgot my password</span></span>
      </div>
    </div>
  );
}