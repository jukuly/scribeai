import { useEffect, useRef, useState } from 'react';
import { Loading } from '../loading/loading';
import { authInstance } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import './popUp.scss';
 
export function PopUp() {
  const [user] = useAuthState(authInstance);
  const [selectedText, setSelectedText] = useState('');
  const [results, setResults] = useState([]);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  function selectedTextListener(text) {
    if (text.length > 512) {
      setLoading(false);
      setValid(false);
      setResults(['Make sure the selected text doesn\'t go over 512 characters']);
      setTimeout(() => closePopUp(), 3000);
    } else {
      setValid(true);
      setSelectedText(text);
      complete(text);
    }
    console.log('selected-text: ' + text);
  }

  function apiResponseListener(text) {
    setLoading(false);
    if (text !== '') setResults(results => [...results, text.replace(/^\s+|\s+$/g, '')]);
    setValid(true);
    console.log('api-response: ' + text);
  }

  useEffect(() => {
    window.api.receive('selected-text', selectedTextListener);
    window.api.receive('api-response', apiResponseListener);

    return () => {
      window.api.removeListener('selected-text');
      window.api.removeListener('api-response');
    };
  }, []);

  useEffect(() => {
    if (ref.current) window.api.setPopUpSize(ref.current.clientWidth, ref.current.clientHeight);
  });

  function apiCall(text) {
    let textToSend = text ? text : selectedText;
    if (!textToSend) {
      if (!textToSend) {
        setLoading(false);
        setValid(false);
        setResults(['Start by highlighting some text']);
        setTimeout(() => closePopUp(), 3000);
      }
      return null;
    };
    setLoading(true);
    setResults([]);
    return textToSend.trim();
  }

  function rephrase(text = null) {
    text = apiCall(text);
    if (!text) return;
    window.api.rephrase(text);
  }

  function translate(language = 'french', text = null) {
    text = apiCall(text);
    if (!text) return;
    window.api.translate(text, language);
  }

  function complete(text = null) {
    text = apiCall(text);
    if (!text) return;
    if (text.includes('.') || text.includes('!') | text.includes('?')) {
      let context;
      let sentence;
      for (let i = text.length; i >= 0; i--) {
        if (text.charAt(i) === '.' || text.charAt(i) === '!' || text.charAt(i) === '?') {
          context = text.slice(0, i+1);
          sentence = text.slice(i+1, text.length);
          break;
        }
      }
      if (context && sentence) {
        for (let i = 0; i < 3; i++) {
          window.api.completeWContext(sentence, context);
        }
      }
    } else {
      for (let i = 0; i < 3; i++) {
        window.api.complete(text);
      }
    }
  }

  function writeText(text) {
    if (valid) {
      window.api.writeText(text);
    }
  }

  function closePopUp() {
    setSelectedText('');
    setResults([]);
    setValid(false);
    setLoading(true);
    window.api.closePopUp();
  }

  return (
    <div className='drag'>
      {
        user ?
        <div className='signed-in' ref={ref}>
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
          {
            valid &&
            <div className='buttons'>
              <button onClick={() => rephrase()}>Rephrase</button>
              <button className='refresh' onClick={() => complete()}>
                <span className='material-symbols-outlined'>
                  refresh
                </span>
              </button>
              <button onClick={() => translate()}>Translate</button>
              <button className='close' onClick={() => closePopUp()}>
                <span className='material-symbols-outlined'>
                  close
                </span>
              </button>
            </div>
          }
        </div>
        : 
        <div className='not-signed-in' ref={ref}>
          <p>Must be signed in in order to use this functionnality</p>
          <button className='close-pop-up' onClick={() => window.api.closePopUp()}>Close</button>
        </div>
      }
    </div>
  );
}