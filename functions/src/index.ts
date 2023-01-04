import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {davinci, curie, babbage} from './openaiFunctions';

admin.initializeApp();

const db = admin.firestore();
const fieldValue = admin.firestore.FieldValue;

interface User {
  expireDate: admin.firestore.FieldValue;
}

export const newUser = functions.auth.user().onCreate((user) => {
  return admin.firestore().doc(`users/${user.uid}`).set({
    expireDate: fieldValue.serverTimestamp()
  });
});

export const openaiCall = functions.https.onCall(async (data, context) => {
  const user = context.auth;
  if (!user) return null;
  const userData = await db.doc(`users/${user.uid}`).get();
  if ((userData.data() as User).expireDate <= fieldValue.serverTimestamp()) return null;

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
