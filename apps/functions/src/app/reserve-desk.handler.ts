import {checkSlackSignature} from './slack/check-slack-signature';
import {SlashCommandRequest} from './slack/slash-command-request';
import {Command} from './command';
import {createDesksViewMessage} from './show-free/desks-view-message.creator';
import * as nodeFetch from 'node-fetch';
import {cancelReservations} from './cancel/cancel.handler';

function formatDate(date: Date): string {
  return date.toISOString().substr(0, 10);
}

function convertDate(dateFromCommand: string): string {
  switch (dateFromCommand) {
    case 'today':
      return formatDate(new Date(new Date().getTime() + 7200000));
    case 'tomorrow':
      return formatDate(new Date(new Date().getTime() + 86400000 + 7200000));
    default:
      return dateFromCommand;
  }
}

function getCommand(commands: string[]): Command {
  console.log('commands:', commands);
  return commands[2] != undefined ? Command.cancel : Command.showfree;
}

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                message: string) {
  await nodeFetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
}

export const reserveDeskFactory = (
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

  const slashCommand: SlashCommandRequest = request.body;
  const commands = slashCommand.text.match(/((cancel)\s)?(today|tomorrow|\d{4}-\d{2}-\d{2})/);
  if (commands) {
    switch (getCommand(commands)) {
      case Command.showfree: {
        const desksViewMessage = await createDesksViewMessage(firebase, slashCommand.user_name, convertDate(commands[3]), slashCommand.trigger_id);
        await sendSlackMessage(slackHttpHeaders, JSON.stringify(desksViewMessage));
        break;
      }
      case Command.cancel: {
        await cancelReservations(firebase, config, slashCommand.user_name, convertDate(commands[3]), slashCommand.response_url);
        break;
      }
    }
    response.status(200).send();
  } else {
    response.contentType('json')
      .status(200)
      .send({
          'response_type': 'ephemeral',
          'blocks': [
            {
              'type': 'section',
              'text': {
                'type': 'mrkdwn',
                'text': 'Please use */rd _date_* where _date_ is "today", "tomorrow" or date in format yyyy-MM-dd to see and reserve desk for selected day\nor */rd cancel _date_* to cancel your reservation for selected day.'
              }
            }]
        }
      );
  }
});
