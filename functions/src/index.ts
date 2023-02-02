import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {davinci, curie, babbage} from './openaiFunctions';

admin.initializeApp();

const db = admin.firestore();

interface User {
  expireDate: admin.firestore.Timestamp;
}

export const newUser = functions.https.onCall(async (data, context) => {
  try {
    const user = await admin.auth().createUser({
      email: data.email,
      emailVerified: false,
      password: data.password,
      displayName: `${data.name} ${data.lastName}`
    });
    db.doc(`user-data-private/${user.uid}`).set({
      expireDate: admin.firestore.Timestamp.now()
    });
    return user;
  } catch (error: any) {
    throw new functions.https.HttpsError(
      'aborted',
      error.code ? error.code : 'Unknown',
      error
    );
  }
});

export const deleteUser = functions.auth.user().onDelete((user) => {
  db.doc(`user-data-private/${user.uid}`).delete();
});

export const openaiCall = functions.https.onCall(async (data, context) => {
  const user = context.auth;
  if (!user) return {response: false};
  const userData = await db.doc(`user-data-private/${user.uid}`).get();
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
