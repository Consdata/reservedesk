import {checkSlackSignature} from './slack/check-slack-signature';
import {SlashCommandRequest} from './slack/slash-command-request';
import {ReserveDeskMessage} from './reserve-desk.message';
import {Command} from './command';

function formatDate(date: Date): string {
  return date.toISOString().substr(0,10);
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

function createPubSubMessage(commands: string[], userName: string, responseUrl: string): ReserveDeskMessage {
  return {
    command: commands[2] != undefined ? Command.cancel : Command.showfree,
    date: convertDate(commands[3]),
    userName: userName,
    responseUrl: responseUrl
  }
}

const commandMapper = new Map([
  [Command.showfree, 'reserve-desk-showfree'],
  [Command.cancel, 'reserve-desk-cancel']
]);

export const reserveDeskFactory = (
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

  const slashCommand: SlashCommandRequest = request.body;
  console.log('slashCommand:', slashCommand);
  const commands = slashCommand.text.match(/((cancel)\s)?(today|tomorrow|\d{4}-\d{2}-\d{2})/);
  if (commands) {
    const message = createPubSubMessage(commands, slashCommand.user_name, slashCommand.response_url);
    await pubsub.topic(commandMapper.get(message.command)).publish(Buffer.from(JSON.stringify(message)));

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
