import {checkSlackSignature} from './slack/check-slack-signature';
import {SlashCommandRequest} from './slack/slash-command-request';
import {showMainMenu} from './main-menu/main-menu.handler';

export const reserveDeskFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config) => functions.https.onRequest(async (request, response) => {

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
  const slashCommand: SlashCommandRequest = request.body;
  await showMainMenu(slackHttpHeaders, slashCommand.trigger_id);
  response.status(200).send();
});
