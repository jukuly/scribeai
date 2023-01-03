import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: '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'
});
const openai = new OpenAIApi(configuration);

export async function davinci(prompt: string, temperature: number): Promise<string | undefined> {
  const result = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    temperature: temperature,
    max_tokens: 128,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const { choices } = { ...result.data };
  return choices[0].text;
}

export async function curie(prompt: string, temperature: number): Promise<string | undefined> {
  const result = await openai.createCompletion({
    model: 'text-curie-001',
    prompt: prompt,
    temperature: temperature,
    max_tokens: 128,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  const { choices } = { ...result.data };
  return choices[0].text;
}

export async function babbage(prompt: string, temperature: number): Promise<string | undefined> {
  const result = await openai.createCompletion({
    model: 'text-babbage-001',
    prompt: prompt,
    temperature: temperature,
    max_tokens: 64,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ['.']
  });
  const { choices } = { ...result.data };
  return choices[0].text;
}