import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import {davinci, curie, babbage} from './openaiFunctions';

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_KEY!, { apiVersion: '2022-11-15' });
const db = admin.firestore();

export const newUser = functions.https.onCall(async (data, context) => {
  return await admin.auth().createUser({
    email: data.email,
    emailVerified: false,
    password: data.password,
    displayName: `${data.name} ${data.lastName}`
  });
});

export const openaiCall = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');

  const role = context.auth.token?.stripeRole;
  const feature = data.feature;

  if (!['basic', 'standard', 'pro'].includes(role) ||
    feature === 'textCompletion' && !['basic', 'standard', 'pro'].includes(role) ||
    feature === 'grammar' && !['standard', 'pro'].includes(role) ||
    feature === 'rephrase' && !['standard', 'pro'].includes(role) ||
    feature === 'translation' && !['standard', 'pro'].includes(role)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions.');
  }

  const today = new Date();

  const todaysCount = (await db.collection(`users/${context.auth?.uid}/open-ai-requests`)
    .where('date', '>=', admin.firestore.Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDay())))
    .get())
    .size; // Replace with .count() when it works
  
  if (todaysCount >= 100 && role === 'basic' ||
    todaysCount >= 500 && role === 'standard') {
    throw new functions.https.HttpsError('resource-exhausted', 'Too many requests today.');
  }

  db.collection(`users/${context.auth?.uid}/open-ai-requests`).add({
    feature: data.feature,
    prompt: data.prompt,
    temperature: data.temperature,
    maxTokens: data.maxTokens,
    date: admin.firestore.Timestamp.now()
  });

  switch (data.model) {
    case 'davinci':
      return { response: await davinci(data.prompt, data.temperature, data.maxTokens) };
    case 'curie':
      return { response: await curie(data.prompt, data.temperature, data.maxTokens) };
    case 'babbage':
      return { response: await babbage(data.prompt, data.temperature, data.maxTokens) };
    default:
      throw new functions.https.HttpsError('unknown', 'Unknown error.')
  }
});

export const upgradeSubscription = functions.https.onCall(async (data, context) => {
  const subscription = (await db.collection(`users/${context.auth?.uid}/subscriptions`)
    .where('ended_at', '==', null)
    .get())
    .docs[0];

  await stripe.subscriptions.update(
    subscription.id, 
    {
      items: [{
        id: subscription.data().items[0].id,
        plan: data.newSubscription,
      }],
      cancel_at_period_end: false
    }
  );
});

export const cancelSubscription = functions.https.onCall(async (data, context) => {
  const subscriptions = (await db.collection(`users/${context.auth?.uid}/subscriptions`)
    .where('ended_at', '==', null)
    .get()).docs;

  subscriptions.forEach(async subscription => {
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });
  });
});