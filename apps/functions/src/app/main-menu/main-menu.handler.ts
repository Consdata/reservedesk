import {sendModalSlackMessage} from '../slack/send-slack-message';

function createMainMessage(triggerId: string) {
  const rooms: string[] = ['Sharki', 'Piranie', 'Lemury', 'Komando', 'Orki', 'Magicy', 'Osy'];
  return {
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Reserve desk'
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true
      },
      blocks: [
        {
          type: 'actions',
          elements: [{
            type: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'Select day',
            },
            action_id: 'date'
          }],
          block_id: 'date'
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'or'
          }
        },
        {
          type: 'actions',
          elements: [{
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select room'
            },
            action_id: 'room',
            options: rooms.map(s => ({
              text: {
                type: 'plain_text',
                text: s,
                emoji: true
              },
              value: s
            }))
          }],
          block_id: 'room',
        }]
    }
  }
}

export const showMainMenu = async (slackHttpHeaders, triggerId: string) => {
  await sendModalSlackMessage(slackHttpHeaders, JSON.stringify(createMainMessage(triggerId)));
};
