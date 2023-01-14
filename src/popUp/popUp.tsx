import { useEffect, useRef, useState } from 'react';
import { Loading } from '../loading/loading';
import { authInstance, functionsInstance } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import './popUp.scss';
import { httpsCallable } from 'firebase/functions';
import React from 'react';
import { Options } from './options/options';

const openaiCall = httpsCallable(functionsInstance, 'openaiCall');
 
export function PopUp() {
  const [user] = useAuthState(authInstance); //User currently signed in
  const [selectedText, setSelectedText] = useState<string>(''); //Text selected by the user
  const [results, setResults] = useState<string[]>([]); //Results from API
  const [options, setOptions] = useState<Set<string>>(new Set()); //Options selected

  const [valid, setValid] = useState<boolean>(false); //If the request is valid
  const [loading, setLoading] = useState<boolean>(true); //True when waiting for response from API
  const [current, setCurrent] = useState<string>('0'); //The id of the service selected
  const win = useRef(null); //Ref to the screen to adjust it's size dynamically

  //Init
  useEffect(() => {
    window.api.receive('selected-text', selectedTextListener);

    return () => {
      window.api.removeListener('selected-text');
    };
  }, []);

  //Resize window
  useEffect(() => {
    if (win.current) window.api.setPopUpSize((win.current as HTMLElement).clientWidth, (win.current as HTMLElement).clientHeight);
  });

  ///////////////////////
  //Real-time listeners//
  ///////////////////////

  function selectedTextListener(text: string): void {
    if (text.length > 512) {
      setLoading(false);
      setValid(false);
      setResults(['Make sure the selected text doesn\'t go over 450 characters']);
    } else if (authInstance.currentUser) {
      setSelectedText(text);
      functions[parseInt(current)](text);
    }
    console.log('selected-text: ' + text);
  }

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

  /////////////
  //API calls//
  /////////////

  function apiCall(text: string | null): string | null {
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

  //The api functions are in an array for easy access depending on the state 'current'
  const functions = [
    async function complete(text: string | null = null): Promise<void> {
      text = apiCall(text);
      if (text === null) return;
      for (let i = 0; i < 3; i++) {
        apiResponse(((await openaiCall(
          { 
            model: 'curie',
            prompt: `${(options.size > 0 && text === '') ? 'Write a sentence' : 'Add to this text'} ${options.size > 0 ? 
              `using these keywords: ${Array.from(options).map((keyword, index) => 
                index < options.size-1 ?
                  index === 0 ?
                    keyword
                  : ` ${keyword}` 
                : ` ${keyword}.`)}`
              : '.'}\n\n${text}`,
            temperature: 1,
            maxTokens: 16 
          }
        )).data as ApiResponse).response);
      }
    },

    async function grammar(text: string | null = null): Promise<void> {
      text = apiCall(text);
      if (!text) return;
      apiResponse(((await openaiCall(
        {
          model: 'babbage',
          prompt: `Correct the grammar.\n\n${
            (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) ? text : `${text}.`
          }\n\n`,
          temperature: 0
        }
      )).data as ApiResponse).response);
    },

    async function rephrase(text: string | null = null): Promise<void> {
      text = apiCall(text);
      if (!text) return;
      apiResponse(((await openaiCall(
        { 
          model: 'davinci',
          prompt: `Rephrase this text.\n\n${
            (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) ? text : `${text}.`
          }\n\n`,
          temperature: 1  
        }
      )).data as ApiResponse).response);
    },
  
    async function translate(text: string | null = null): Promise<void> {
      text = apiCall(text);
      if (!text) return;
      const language = (options.size > 0) ? [...options][0] : 'english';
      apiResponse(((await openaiCall(
        { 
          model: 'curie',
          prompt: `Translate this text to ${language}.\n\n${
            (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) ? text : `${text}.`
          }\n\n`,
          temperature: 0  
        }
      )).data as ApiResponse).response);
    }
  ];
  
  //////////////////////////////
  //Buttons on click functions//
  //////////////////////////////

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
    functions[parseInt(current)]();
  }

  ///////
  //JSX//
  ///////

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
            (current === '0' || current === '3') &&
            <Options onUpdateContent={(options: Set<string>) => setOptions(options)} 
              contentSize={current === '0' ? 5 : current === '3' ? 1 : 0} 
              placeholder={current === '0' ? 'Keywords (max. 5)' : current === '3' ? 'Language' : ''} />
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