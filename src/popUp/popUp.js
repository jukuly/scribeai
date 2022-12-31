import { useState } from "react";
import './popUp.scss';

export function PopUp({user}) {
  const [selectedText, setSelectedText] = useState('');

  async function getSelectedText() {
    setSelectedText(await window.api.getSelectedText());
  }

  return (
    user ?
    <div className="signed-in">
      <button onClick={async () => getSelectedText()}>Get selected text</button>
      <p>{selectedText}</p>
    </div>
    : 
    <div className="not-signed-in">
      <div>Must be signed in to use this functionnality</div>
      <button onClick={() => window.api.closePopUp()}>Close</button>
    </div>
  );
}