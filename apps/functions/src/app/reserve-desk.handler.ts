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
      return formatDate(new Date());
    case 'tomorrow':
      return formatDate(new Date(new Date().getTime() + 86400000));
    default:
      return dateFromCommand;
  }
}

function createPubSubMessage(commands: string[], userName: string): ReserveDeskMessage {
  return {
    command: Command[commands[1]],
    date: convertDate(commands[2]),
    room: commands[4],
    desk: commands[5],
    userName: userName
  }
}

const commandMapper = new Map([
  [Command.showfree, 'reserve-desk-showfree'],
  [Command.reserve, 'reserve-desk-reserve'],
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
  const commands = slashCommand.text.match(/(showfree|reserve|cancel)\s(today|tomorrow|\d{4}-\d{2}-\d{2})(\s(\S*)\s(\S*))?/);
  if (commands) {
    const message = createPubSubMessage(commands, slashCommand.user_name);
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
                'text': 'Please use /rd _command_ _date_ _room_ _desk_, where:\n- command is one of: "showfree", "reserve", "cancel"\n- date is "today", "tomorrow" or date in format yyyy-MM-dd\n- room is one of: "sharki", "piranie", "lemury", "komando", "orki", "magicy", "osy"\n- desk is a name of a desk'
              }
            }]
        }
      );
  }
});
