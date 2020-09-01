import {sendSlackMessage} from '../slack/send-slack-message';

export const cancelReservations = async (firebase: typeof import('firebase-admin'),
                                         config: import('firebase-functions').config.Config,
                                         userName: string,
                                         date: string,
                                         responseUrl: string) => {

  const slackHttpHeaders = {
    Authorization: `Bearer ${config.slack.bottoken}`,
    'Content-type': 'application/json'
  };

  const firestore = firebase.firestore();
  const reservationsRef = firestore.collection('reservationDesk');
  const reserved = await reservationsRef
    .where('date', '==', date)
    .where('userName', '==', userName)
    .get();
  for (const doc of reserved.docs) {
    await doc.ref.delete();
  }

  await sendSlackMessage(
    slackHttpHeaders,
    responseUrl,
    `Your reservations for ${date} have been canceled!`);
};
