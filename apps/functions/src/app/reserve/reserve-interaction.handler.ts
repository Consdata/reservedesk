import {checkSlackSignature} from '../slack/check-slack-signature';
import {ReserveInteractionRequest} from './reserve-interaction-request';
import {ReserveDeskMessage} from '../reserve-desk.message';
import {Command} from '../command';

function createPubSubMessage(interactionRequest: ReserveInteractionRequest): ReserveDeskMessage {
  const actionValue = interactionRequest.actions[0].value;
  console.log('actionValue:', actionValue);
  return {
    command: Command.reserve,
    date: actionValue.substr(0, 10),
    room: actionValue.substring(11, actionValue.lastIndexOf('_')),
    desk: actionValue.substr(actionValue.lastIndexOf('_') + 1),
    userName: interactionRequest.user.username,
    responseUrl: interactionRequest.response_url
  }
}

export const reserveInteractionFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  pubsub: import('@google-cloud/pubsub').PubSub) => functions.https.onRequest(async (request, response) => {
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

  const message = createPubSubMessage(interactionRequest);
  await pubsub.topic('reserve-desk-reserve').publish(Buffer.from(JSON.stringify(message)));

  response.status(200).send();
});
