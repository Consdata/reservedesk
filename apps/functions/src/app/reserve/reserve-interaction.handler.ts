import {checkSlackSignature} from '../slack/check-slack-signature';
import {ReserveInteractionRequest} from './reserve-interaction-request';
import {ReserveDesk} from '../reserve-desk';
import {createDesksViewMessage} from '../show-free/desks-view-message.creator';
import * as nodeFetch from 'node-fetch';

function extractReserveDeskData(interactionRequest: ReserveInteractionRequest): ReserveDesk {
  const actionValue = interactionRequest.actions[0].value;
  return {
    date: actionValue.substr(0, 10),
    room: actionValue.substring(11, actionValue.lastIndexOf('_')),
    desk: actionValue.substr(actionValue.lastIndexOf('_') + 1)
  }
}

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                message: string) {
  await nodeFetch('https://slack.com/api/views.update', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
}

export const reserveInteractionFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firebase: typeof import('firebase-admin')) => functions.https.onRequest(async (request, response) => {

  const slackHttpHeaders = {
    Authorization: `Bearer ${config.slack.bottoken}`,
    'Content-type': 'application/json'
  };

  if (request.method !== 'POST') {
    response.status(405).send('Invalid request method (only POST allowed)');
  }
  if (!checkSlackSignature(
    config.slack.signingsecret,
    request.headers['x-slack-signature'] as string,
    request.headers['x-slack-request-timestamp'],
    request.rawBody.toString()
  )) {
    response.status(401).send('Invalid slack signing');
  }

  console.log('request:', request.body.payload);
  const interactionRequest: ReserveInteractionRequest = JSON.parse(request.body.payload);

  const reserveDeskData = extractReserveDeskData(interactionRequest);

  const firestore = firebase.firestore();
  const docId = reserveDeskData.date.concat(reserveDeskData.room).concat(reserveDeskData.desk);
  const reservationRef = firestore.collection('reservationDesk').doc(docId);
  const reserved = await reservationRef.get();
  if (!reserved.exists) {
    const result = await firestore.runTransaction(async t => {
      const reservation = await t.get(reservationRef);
      if (!reservation.exists) {
        await t.set(reservationRef, {
          date: reserveDeskData.date,
          room: reserveDeskData.room,
          desk: reserveDeskData.desk,
          userName: interactionRequest.user.username
        });
        return true;
      } else {
        return false;
      }
    });
    if (result) {
      const desksViewMessage = await createDesksViewMessage(
        firebase,
        interactionRequest.user.username,
        reserveDeskData.date,
        interactionRequest.trigger_id,
        interactionRequest.view.id);
      await sendSlackMessage(slackHttpHeaders, JSON.stringify(desksViewMessage));
    }
  }
  response.status(200).send();
});
