import { useState } from "react";
import './popUp.scss';

export function PopUp() {
  const [selectedText, setSelectedText] = useState('');

  async function getSelectedText() {
    setSelectedText(await window.api.getSelectedText());
  }

  return (
    <div className="pop-up">
      <button onClick={async () => getSelectedText()}>Get selected text</button>
      <p>{selectedText}</p>
    </div> 
  );
}