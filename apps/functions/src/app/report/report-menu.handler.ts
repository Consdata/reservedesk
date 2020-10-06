import {pushModalSlackMessage} from '../slack/send-slack-message';

function createReportMessage(triggerId: string) {
  return {
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Select range'
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true
      },
      submit: {
        type: 'plain_text',
        text: 'Generate',
        emoji: true
      },
      blocks: [
        {
          type: 'actions',
          elements: [{
            type: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'From'
            },
            action_id: 'dateFrom'
          }, {
            type: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'To'
            },
            action_id: 'dateTo'
          }
          ],
          block_id: 'reportDates'
        },
      ]
    }
  }
}

export const showReportMenu = async (slackHttpHeaders, triggerId: string) => {
  await pushModalSlackMessage(slackHttpHeaders, JSON.stringify(createReportMessage(triggerId)));
};
