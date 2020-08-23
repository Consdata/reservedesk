import {ReserveDeskMessage} from '../reserve-desk.message';
import * as nodeFetch from 'node-fetch';

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string }, channel: string, message: string) {
  await nodeFetch(`https://slack.com/api/chat.postMessage`, {
    method: 'POST',
    headers: slackHttpHeaders,
    body: JSON.stringify({
      channel: channel,
      text: message
    })
  });
}

const roomsDefinitions = [
  {
    name: 'sharki',
    desks: ['b1', 'b2', 'b3', 'b4', 'b5']
  },
  {
    name: 'piranie',
    desks: ['b1', 'b2', 'b3', 'b4']
  },
  {
    name: 'lemury',
    desks: ['b1', 'b2', 'b3', 'b4'],
  },
  {
    name: 'komando',
    desks: ['b1', 'b2', 'b3', 'b4', 'b5'],
  },
  {
    name: 'orki',
    desks: ['b1', 'b2'],
  },
  {
    name: 'magicy',
    desks: ['b1', 'b2', 'b3'],
  },
  {
    name: 'osy',
    desks: ['b1', 'b2']
  }
];

function createMessage(reservedDesksInRooms: Map<string, string[]>) {
  let message = '';
  roomsDefinitions.forEach((room) => {
    message += room.name + ':';
    room.desks.forEach(desk => {
      if (reservedDesksInRooms.get(room.name) == undefined || !reservedDesksInRooms.get(room.name).includes(desk)) {
        message += ' ' + desk + ',';
      }
    });
    message += '\n';
  });
  return message;
}

export const showFreeFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firebase: typeof import('firebase-admin')) => {

  const slackHttpHeaders = {
    Authorization: `Bearer ${config.slack.bottoken}`,
    'Content-type': 'application/json'
  };

  return functions.pubsub.topic('reserve-desk-showfree').onPublish(
    async (topicMessage, context) => {
      const payload: ReserveDeskMessage = JSON.parse(Buffer.from(topicMessage.data, 'base64').toString());

      const firestore = firebase.firestore();
      const reservationsRef = firestore.collection('reservationDesk');
      const reserved = await reservationsRef
        .where('date', '==', payload.date)
        .orderBy('room')
        .orderBy('desk')
        .get();
      const reservedDesksInRooms = new Map<string, string[]>();
      reserved.forEach(r => {
        if (reservedDesksInRooms.get(r.data().room) == undefined) {
          reservedDesksInRooms.set(r.data().room, []);
        }
        reservedDesksInRooms.get(r.data().room).push(r.data().desk);
      });
      const message = createMessage(reservedDesksInRooms);
      await sendSlackMessage(slackHttpHeaders, `@${payload.userName}`, 'Free desks on ' + payload.date + ':\n' + message);
    });
};
