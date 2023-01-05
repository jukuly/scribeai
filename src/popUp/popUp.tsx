import { useEffect, useRef, useState } from 'react';
import { Loading } from '../loading/loading';
import { authInstance, functionsInstance } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import './popUp.scss';
import { httpsCallable } from 'firebase/functions';
import React from 'react';

const openaiCall = httpsCallable(functionsInstance, 'openaiCall');
 
export function PopUp() {
  const [user] = useAuthState(authInstance); //User currently signed in
  const [selectedText, setSelectedText] = useState<string>(''); //Text selected by the user
  const [results, setResults] = useState<string[]>([]); //Results from API
  const [keywords, setKeywords] = useState<Set<string>>(new Set()); //Keywords selected
  const [keyword, setKeyword] = useState<string>(''); //Current keyword being typed

  const [valid, setValid] = useState<boolean>(false); //If the request is valid
  const [loading, setLoading] = useState<boolean>(true); //True when waiting for response from API
  const [showKeywords, setShowKeywords] = useState<boolean>(true); //Whether of not to show the keyword field

  const win = useRef(null); //Ref to the screen to adjust it's size dynamically
  const select = useRef(null); //Ref to the select function menu

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
      setResults(['Make sure the selected text doesn\'t go over 500 characters']);
    } else if (authInstance.currentUser) {
      setSelectedText(text);
      const current = select.current ? parseInt((select.current! as HTMLSelectElement).value) : 0;
      functions[current](text);
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
    if (text !== '') setResults(results => [...results, text.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ')]);
    setValid(true);
    console.log('api-response: ' + text);
  }

  /////////////
  //API calls//
  /////////////

  function apiCall(text: string | null): string | null {
    let textToSend = text ? text : selectedText;
    if (!textToSend) {
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
      if (!text) return;
      for (let i = 0; i < 3; i++) {
        apiResponse(((await openaiCall(
          { 
            model: 'curie',
            prompt: `Add to this text${keywords.size > 0 ? 
              `using these keywords: ${Array.from(keywords).map((keyword, index) => 
                index < keywords.size-1 ? 
                `${keyword}, ` 
                : `${keyword}.`)}`
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
  
    async function translate(language: string = 'english', text: string | null = null): Promise<void> {
      text = apiCall(text);
      if (!text) return;
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

  function record(): void {
    //TODO function that records every keystroke to make more accurate predictions, limits at 500 characters
  }

  function refresh(): void {
    functions[parseInt((select.current! as HTMLSelectElement).value)]();
  }

  function addKeyword(keyword: string): void {
    keyword = keyword.trim();
    if (keyword === '' || keywords.size >= 5) return;
    setKeywords(keywords => {
      const newSet = new Set(keywords);
      newSet.add(keyword);
      return newSet;
    });
    setKeyword('');
  }

  function removeKeyword(keyword: string): void {
    setKeywords(keywords => {
      const newSet = new Set(keywords);
      newSet.delete(keyword);
      return newSet;
    });
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
            <select className='action' ref={select} onChange={() => setShowKeywords((select.current! as HTMLSelectElement).value === '0')}>
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
            <button className='record' onClick={() => record()}>
              <span className='material-symbols-outlined'>
                radio_button_checked
              </span>
            </button>
            <button className='close' onClick={() => closePopUp()}>
              <span className='material-symbols-outlined'>
                close
              </span>
            </button>
          </div>
          {
            showKeywords  &&
            <div className='keywords'>
              {
                Array.from(keywords).map((word, index) => 
                  <span className='keyword' 
                    onClick={() => removeKeyword(word as string)} key={index}>
                    <>
                      {word}
                      <span className='material-symbols-outlined copy-icon'>
                        close
                      </span>
                    </>
                  </span>
                )
              }
              <form onSubmit={event => {
                event.preventDefault();
                addKeyword(keyword);
              }}>
                <input className='add-keyword' type='text' placeholder='Keywords (max. 5)' value={keyword} 
                  onChange={event => setKeyword(event.target.value)} maxLength={25}></input>
              </form>
            </div>
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