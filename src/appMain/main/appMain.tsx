import React from 'react';
import { authInstance } from '../../firebase';
import './appMain.scss';

export function AppMain() {

  function signOut(): void {
    authInstance.signOut();
  }

  return (
    <div className='app'>
      <button className='sign-out' onClick={() => signOut()}>Sign out</button>
    </div> 
  );
}