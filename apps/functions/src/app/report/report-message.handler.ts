import {ReportMessage} from './report-message';
import * as admin from 'firebase-admin';
import {uploadFileSlackMessage} from '../slack/send-slack-message';

export const reportFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firestore: admin.firestore.Firestore) => {

  return functions.pubsub.topic('reserve-desk-report').onPublish(
    async (topicMessage, context) => {

      const slackHttpHeaders = {
        Authorization: `Bearer ${config.slack.bottoken}`,
        'Content-type': 'application/x-www-form-urlencoded'
      };

      const payload: ReportMessage = JSON.parse(Buffer.from(topicMessage.data, 'base64').toString());

      const reservationsRef = firestore.collection('reservationDesk');
      const reserved = await reservationsRef
        .where('date', '>=', payload.dateFrom)
        .where('date', '<=', payload.dateTo)
        .orderBy('date').orderBy('room').orderBy('desk').orderBy('userName')
        .get();
      let fileContent = '';
      reserved.forEach(r => {
        fileContent = fileContent.concat(`${r.data().date},${r.data().userName},${r.data().room},${r.data().desk}\n`);
      });
      await uploadFileSlackMessage(slackHttpHeaders, payload.channel, fileContent);
    }
  );
};
