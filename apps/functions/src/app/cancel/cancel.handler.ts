import {ReserveDeskMessage} from '../reserve-desk.message';
import * as nodeFetch from 'node-fetch';

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string }, channel: string, message: string) {
  await nodeFetch(`https://slack.com/api/chat.postMessage`, {
    method: 'POST',
    headers: slackHttpHeaders,
    body: JSON.stringify({
      channel: channel,
      text: message
    })
  });
}

export const cancelFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firebase: typeof import('firebase-admin')) => {

  const slackHttpHeaders = {
    Authorization: `Bearer ${config.slack.bottoken}`,
    'Content-type': 'application/json'
  };

  return functions.pubsub.topic('reserve-desk-cancel').onPublish(
    async (topicMessage, context) => {
      const payload: ReserveDeskMessage = JSON.parse(Buffer.from(topicMessage.data, 'base64').toString());

      const firestore = firebase.firestore();
      const reservationsRef = firestore.collection('reservationDesk');
      const reserved = await reservationsRef
        .where('date', '==', payload.date)
        .where('userName', '==', payload.userName)
        .get();
      for (const doc of reserved.docs) {
        await doc.ref.delete();
      }

      await sendSlackMessage(
        slackHttpHeaders,
        `@${payload.userName}`,
        `Your reservations for ${payload.date} have been canceled!`);
    }
  );
};
