import { useEffect, useRef, useState } from 'react';
import './popUp.scss';
 
export function PopUp({user}) {
  const [selectedText, setSelectedText] = useState('');
  const [results, setResults] = useState([]);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  function selectedTextListener(text) {
    if (text.length > 192) {
      setValid(false);
      setResults(['Make sure the selected text doesn\'t go over 192 characters']);
    } else {
      setValid(true);
      setSelectedText(text);
      complete(text);
    }
    console.log('selected-text');
  }

  function apiResponseListener(text) {
    setResults(results => [...results, text]);
    setValid(true);
    console.log('api-response');
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

  function rephrase(text = null) {
    if (!text) text = selectedText;
    if (!text || !valid) return;
    setResults([]);
    setSelectedText(text.trim());
    window.api.rephrase(text);
  }

  function translate(language = 'french', text = null) {
    if (!text) text = selectedText;
    if (!text || !valid) return;
    setResults([]);
    setSelectedText(text.trim());
    window.api.translate(text, language);
  }

  function complete(text = null) {
    if (!text) text = selectedText;
    if (!text) return;
    setResults([]);
    setSelectedText(text.trim());
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

  return (
    user ?
    <div className='signed-in' ref={ref}>
      {
        results.map((text, index) => 
          <div className={valid ? 'result clickable' : 'result'} 
                onClick={() => writeText(text)} key={index}>{text}</div>
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
        </div>
      }
    </div>
    : 
    <div className='not-signed-in' ref={ref}>
      <p>Must be signed in in order to use this functionnality</p>
      <button className='close-pop-up' onClick={() => window.api.closePopUp()}>Close</button>
    </div>
  );
}