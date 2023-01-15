import { functionsInstance } from './firebase';
import { httpsCallable } from 'firebase/functions';

const openaiCall = httpsCallable(functionsInstance, 'openaiCall');

export default [
  async function complete(
      text: string | null, 
      callback: (response: string) => void, 
      options: Set<string>
    ): Promise<void> {

    if (text === null) return;
    for (let i = 0; i < 3; i++) {
      callback(((await openaiCall(
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

  async function grammar(
      text: string | null, 
      callback: (response: string) => void, 
      options: Set<string>
    ): Promise<void> {

    if (!text) return;
    callback(((await openaiCall(
      {
        model: 'babbage',
        prompt: `Correct the grammar.\n\n${
          (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) ? text : `${text}.`
        }\n\n`,
        temperature: 0
      }
    )).data as ApiResponse).response);
  },

  async function rephrase(
      text: string | null, 
      callback: (response: string) => void, 
      options: Set<string>
    ): Promise<void> {

    if (!text) return;
    callback(((await openaiCall(
      { 
        model: 'davinci',
        prompt: `Rephrase this${options.size > 0 ? ` using this style: ${[...options][0]}` : ''}.\n\n${
          (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) ? text : `${text}.`
        }\n\n`,
        temperature: 1  
      }
    )).data as ApiResponse).response);
  },

  async function translate(
      text: string | null, 
      callback: (response: string) => void, 
      options: Set<string>
    ): Promise<void> {

    if (!text) return;
    const language = (options.size > 0) ? [...options][0] : 'english';
    callback(((await openaiCall(
      { 
        model: 'curie',
        prompt: `Translate this into ${language}:\n\n${
          (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) ? text : `${text}.`
        }\n\n`,
        temperature: 0.3  
      }
    )).data as ApiResponse).response);
  }
];