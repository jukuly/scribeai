import { useEffect, useRef, useState } from "react";
import './popUp.scss';
 
export function PopUp({user}) {
  const [selectedText, setSelectedText] = useState('');
  const ref = useRef(null);

  window.api.receive('selected-text', text => setSelectedText(text));

  useEffect(() => {
    if (ref.current) window.api.setPopUpSize(ref.current.clientWidth, ref.current.clientHeight);
    if (ref.current) console.log(ref.current.clientWidth + ', ' + ref.current.clientHeight)
  });

  return (
    user ?
    <div className="signed-in" ref={ref}>
      <p>{selectedText}</p>
    </div>
    : 
    <div className="not-signed-in">
      <div>Must be signed in to use this functionnality</div>
      <button onClick={() => window.api.closePopUp()}>Close</button>
    </div>
  );
}