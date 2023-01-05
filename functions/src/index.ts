import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {davinci, curie, babbage} from './openaiFunctions';

admin.initializeApp();

const db = admin.firestore();

interface User {
  expireDate: admin.firestore.Timestamp;
}

export const newUser = functions.auth.user().onCreate((user) => {
  return admin.firestore().doc(`users/${user.uid}`).set({
    expireDate: admin.firestore.Timestamp.now()
  });
});

export const openaiCall = functions.https.onCall(async (data, context) => {
  const user = context.auth;
  if (!user) return {response: false};
  const userData = await db.doc(`users/${user.uid}`).get();
  if (((userData.data() as User).expireDate as admin.firestore.Timestamp) <= admin.firestore.Timestamp.now()) return {response: false};

  switch (data.model) {
    case 'davinci':
      return {response: await davinci(data.prompt, data.temperature, data.maxTokens)};
    case 'curie':
      return {response: await curie(data.prompt, data.temperature, data.maxTokens)};
    case 'babbage':
      return {response: await babbage(data.prompt, data.temperature, data.maxTokens)};
    default:
      return {response: false};
  }
});
