import React, { useEffect, useState } from "react";
import './options.scss'

//Component
export function Options({ onUpdateContent, contentSize, placeholder }: 
    { 
      onUpdateContent: (content: Set<string>) => void, 
      contentSize: number, 
      placeholder: string 
    }) {
      
  const [content, setContent] = useState<Set<string>>(new Set()); //Keywords or language selected
  const [word, setWord] = useState<string>(''); //Current keyword or language being typed

  useEffect(() => onUpdateContent(content), [content])

  function addWord(word: string): void {
    word = word.trim();
    if (word === '' || content.size >= contentSize) return;
    setContent(content => {
      const newSet = new Set(content);
      newSet.add(word);
      return newSet;
    });
    setWord('');
  }

  function removeWord(word: string): void {
    setContent(content => {
      const newSet = new Set(content);
      newSet.delete(word);
      return newSet;
    });
  }

  return (
    <div className='keywords'>
      {
        Array.from(content).map((word, index) => 
          <span className='keyword' 
            onClick={() => removeWord(word as string)} key={index}>
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
        addWord(word);
      }}>
        <input className='add-keyword' type='text' placeholder={placeholder} value={word} 
          onChange={event => setWord(event.target.value)} maxLength={25}></input>
      </form>
    </div>
  );
}