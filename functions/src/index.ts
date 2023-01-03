import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {davinci, curie, babbage} from './openaiFunctions';

admin.initializeApp();

export const newUser = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    preferences: {
      translationLanguage: 'english',
      writingStyle: 'formal',
    },
    expireDate: admin.firestore.FieldValue.serverTimestamp(),
  });
});

export const openaiCall = functions.https.onCall(async (data, context) => {
  switch (data.model) {
    case 'davinci':
      return {response: await davinci(data.prompt, data.temperature, data.maxTokens)};
    case 'curie':
      return {response: await curie(data.prompt, data.temperature, data.maxTokens)};
    case 'babbage':
      return {response: await babbage(data.prompt, data.temperature, data.maxTokens)};
    default:
      return null;
  }
});
