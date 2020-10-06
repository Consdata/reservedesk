import {checkSlackSignature} from './slack/check-slack-signature';
import {ReserveInteractionRequest} from './reserve-interaction-request';
import {showMainMenu} from './main-menu/main-menu.handler';
import {showFreeRooms} from './show-free/show-free-rooms.handler';
import * as admin from 'firebase-admin';
import {reserveDesk} from './reserve/reserve.handler';
import {showReportMenu} from './report/report-menu.handler';
import {ReportMessage} from './report/report-message';
import {createReportMessage} from './report/report-message.creator';

export const reserveInteractionFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firestore: admin.firestore.Firestore,
  pubsub: import('@google-cloud/pubsub').PubSub) => functions.https.onRequest(async (request, response) => {

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
  let reportMessage: ReportMessage = null;
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
      } else if (interactionRequest.actions[0].action_id == 'report') {
        await showReportMenu(slackHttpHeaders, interactionRequest.trigger_id);
      }
      break;
    case 'view_submission':
      reportMessage = createReportMessage(
        interactionRequest.view.state.values.reportDates.dateFrom.selected_date,
        interactionRequest.view.state.values.reportDates.dateTo.selected_date,
        interactionRequest.user.username);
      await pubsub.topic('reserve-desk-report').publish(Buffer.from(JSON.stringify(reportMessage)));
      break;
  }
  response.status(200).send({response_action: 'clear'});
});
