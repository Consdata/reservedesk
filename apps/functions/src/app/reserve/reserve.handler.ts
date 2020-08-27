import {ReserveDeskMessage} from '../reserve-desk.message';
import {sendSlackMessage} from '../slack/send-slack-message';

function createSuccessMessage(messageData: ReserveDeskMessage): string {
  return `Desk ${messageData.desk} in room ${messageData.room} is reserved for You on ${messageData.date}!`;
}

export const reserveFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firebase: typeof import('firebase-admin')) => {

  const slackHttpHeaders = {
    Authorization: `Bearer ${config.slack.bottoken}`,
    'Content-type': 'application/json'
  };

  return functions.pubsub.topic('reserve-desk-reserve').onPublish(
    async (topicMessage, context) => {
      const payload: ReserveDeskMessage = JSON.parse(Buffer.from(topicMessage.data, 'base64').toString());

      const firestore = firebase.firestore();
      const docId = payload.date.concat(payload.room).concat(payload.desk);
      const reservationRef = firestore.collection('reservationDesk').doc(docId);
      const reserved = await reservationRef.get();
      if (!reserved.exists) {
        const result = await firestore.runTransaction(async t => {
          const reservation = await t.get(reservationRef);
          if (!reservation.exists) {
            await t.set(reservationRef, {
              date: payload.date,
              room: payload.room,
              desk: payload.desk,
              userName: payload.userName
            });
            return true;
          } else {
            return false;
          }
        });
        if (result) {
          await sendSlackMessage(slackHttpHeaders, payload.responseUrl, createSuccessMessage(payload));
        }
      } else {
        await sendSlackMessage(
          slackHttpHeaders,
          payload.responseUrl,
          `The desk is already reserved by @${reserved.data().userName}!`);
      }
    });
};
