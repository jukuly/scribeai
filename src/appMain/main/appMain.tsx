import React from 'react';
import { authInstance } from '../../firebase';
import './appMain.scss';

function signOut(): void {
  authInstance.signOut();
}

//Component
export function AppMain() {
  return (
    <div className='app'>
      <button className='profile' onClick={() => window.api.openInBrowser('https://www.youtube.com')}>Profile</button>
      <button className='sign-out' onClick={() => signOut()}>Sign out</button>
    </div> 
  );
}