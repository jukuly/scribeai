import { useEffect, useRef, useState } from 'react';
import { Loading } from '../loading/loading';
import { authInstance } from '../firebase';
import './popUp.scss';

import { Options } from './options/options';
import APIFunctions from '../apiCallFunctions';
import { User } from 'firebase/auth';
import React from 'react';
 
//Component
export function PopUp({ user }: { user: User | null }) {
  const [selectedText, setSelectedText] = useState<string>(''); //Text selected by the user
  const [results, setResults] = useState<string[]>([]); //Results from API
  const [options, setOptions] = useState<Set<string>>(new Set()); //Options selected

  const [valid, setValid] = useState<boolean>(false); //If the request is valid
  const [loading, setLoading] = useState<boolean>(true); //True when waiting for response from API
  const [current, setCurrent] = useState<string>('0'); //The id of the service selected
  const win = useRef(null); //Ref to the screen to adjust it's size dynamically

  //Init listeners for messages from main process
  useEffect(() => {
    window.api.receive('selected-text', (text: string) => {
      setSelectedText(text);
      if (text.length > 512) {
        setLoading(false);
        setValid(false);
        setResults(['Make sure the selected text doesn\'t go over 450 characters']);
      } else if (authInstance.currentUser) {
        APIFunctions[parseInt(current)](apiCall(text), apiResponse, options);
      }
      console.log('selected-text: ' + text);
    });

    //Cleanup function
    return () => {
      window.api.removeListener('selected-text');
    };
  }, [current, options]); //Takes these two states as dependency so their values are correct

  //Resize window to fit content
  useEffect(() => {
    if (win.current) window.api.setPopUpSize((win.current as HTMLElement).clientWidth, (win.current as HTMLElement).clientHeight);
  });

  //Callback for an API call
  function apiResponse(text: string): void {
    if (!text) {
      setLoading(false);
      setValid(false);
      setResults(['An error occured while trying to reach the API']);
      return;
    }
    setLoading(false);
    if (text !== '') {
      const textLines = text.split('\n');
      let i = 0;
      while (i < textLines.length-1 && textLines[i].replace(/\s/g, '').length === 0) {
        i++;
      }
      setResults(results => [...results, text.split('\n')[i].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ')]);
    }
    setValid(true);
    console.log('api-response: ' + text);
  }

  //API call text pre-processor
  function apiCall(text: string | null = null): string | null {
    let textToSend = text ? text : selectedText;
    if (!textToSend && (current !== '0' || options.size === 0)) {
      setLoading(false);
      setValid(false);
      setResults(['Start by highlighting some text']);
      return null;
    }
    setLoading(true);
    setResults([]);
    return textToSend.trim();
  }
  
  //On click functions
  function writeText(text: string): void {
    if (valid) {
      window.api.writeText(text);
    }
  }

  function closePopUp(): void {
    setSelectedText('');
    setResults([]);
    setValid(false);
    setLoading(true);
    window.api.closePopUp();
  }

  function refresh(): void {
    if (selectedText.length > 512) {
      setLoading(false);
      setValid(false);
      setResults(['Make sure the selected text doesn\'t go over 450 characters']);
    } else if (authInstance.currentUser) {
      APIFunctions[parseInt(current)](apiCall(selectedText), apiResponse, options);
    }
    APIFunctions[parseInt(current)](apiCall(selectedText), apiResponse, options);
  }

  //JSX template
  return (
    <div className='drag'>
      {
        user ?
        <div className='signed-in' ref={win}>
          {
            loading ?
              <Loading />
            :
            results.map((text, index) => 
              <div className={valid ? 'result clickable' : 'result'} 
                onClick={() => writeText(text)} key={index}>{text}
                {
                  valid &&
                  <span className='material-symbols-outlined copy-icon'>
                    content_copy
                  </span>
                }
              </div>
            )
          }
          <div className='buttons'>
            <select className='action' value={current} onChange={event => setCurrent(event.target.value)}>
              <option value='0'>Complete</option>
              <option value='1'>Grammar</option>
              <option value='2'>Rephrase</option>
              <option value='3'>Translate</option>
            </select>
            <button className='refresh' onClick={() => refresh()}>
              <span className='material-symbols-outlined'>
                refresh
              </span>
            </button>
            <button className='close' onClick={() => closePopUp()}>
              <span className='material-symbols-outlined'>
                close
              </span>
            </button>
          </div>
          {
            (current === '0' || current === '2' || current === '3') &&
            <Options onUpdateContent={(options: Set<string>) => setOptions(options)} 
              contentSize={current === '0' ? 5 : current === '3' || current === '2' ? 1 : 0} 
              placeholder={current === '0' ? 'Keywords (max. 5)' : current === '2' ? 'Style' : current === '3' ? 'Language' : '' } />
          }
        </div>
        : 
        <div className='not-signed-in' ref={win}>
          <p>Must be signed in in order to use this functionnality</p>
          <button className='close-pop-up' onClick={() => window.api.closePopUp()}>Close</button>
        </div>
      }
    </div>
  );
}