import {checkSlackSignature} from './slack/check-slack-signature';
import {ReserveInteractionRequest} from './reserve-interaction-request';
import {showMainMenu} from './main-menu/main-menu.handler';
import {showFreeRooms} from './show-free/show-free-rooms.handler';
import * as admin from 'firebase-admin';
import {reserveDesk} from './reserve/reserve.handler';

export const reserveInteractionFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firestore: admin.firestore.Firestore) => functions.https.onRequest(async (request, response) => {

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
    console.error('Invalid slack signing');
    response.status(401).send('Invalid slack signing');
    return;
  }

  const interactionRequest: ReserveInteractionRequest = JSON.parse(request.body.payload);
  switch (interactionRequest.type) {
    case 'shortcut':
      await showMainMenu(slackHttpHeaders, interactionRequest.trigger_id);
      break;
    case 'block_actions':
      if (interactionRequest.actions[0].action_id == 'date') {
        await showFreeRooms(
          slackHttpHeaders,
          firestore,
          interactionRequest.user.username,
          interactionRequest.actions[0].selected_date,
          interactionRequest.trigger_id,
          interactionRequest.view.id);
      } else if (interactionRequest.actions[0].action_id == 'reserve') {
        await reserveDesk(
          slackHttpHeaders,
          firestore,
          interactionRequest.user.username,
          interactionRequest.actions[0].value,
          interactionRequest.trigger_id,
          interactionRequest.view.id);
      }
      break;
  }
  response.status(200).send();
});
