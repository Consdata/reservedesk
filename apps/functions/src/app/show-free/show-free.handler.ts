import {ReserveDeskMessage} from '../reserve-desk.message';
import * as nodeFetch from 'node-fetch';
import {roomsDefinitions} from './rooms-definitions';

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                responseUrl: string,
                                message: string) {
  await nodeFetch(responseUrl, {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
}

function createMessage(reservedDesksInRooms: Map<string, any[]>, channel: string, date: string) {
  const deskReserved = (roomName: string, deskName: string): boolean =>
    reservedDesksInRooms.get(roomName) != undefined && reservedDesksInRooms.get(roomName).map((value) => {
      console.log('value.desk:',value.desk);
      return value.desk;
    }).includes(deskName);

  let blocks = [];
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Please select one desk for *${date}*:`
    }
  });
  blocks = blocks.concat(...(roomsDefinitions.map((def) => {
    const elements = def.desks.map((desk) => ({
      type: 'button',
      text: {
        type: 'plain_text',
        text: desk.name + ' ' + desk.dockStation
      },
      style: deskReserved(def.name, desk.name) ? 'danger' : 'primary',
      value: date + '_' + def.name + '_' + desk.name
    }));
    const roomsBlocks = [];
    roomsBlocks.push({
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<' + def.wikiLink + '|' + def.name + '>*'
        }
      },
      {
        type: 'actions',
        elements: elements
      }
    );
    if (reservedDesksInRooms.get(def.name) != undefined) {
      reservedDesksInRooms.get(def.name).forEach((value) => roomsBlocks.push(
        {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url: 'https://api.slack.com/img/blocks/bkb_template_images/notificationsWarningIcon.png',
              'alt_text': 'notifications warning icon'
            },
            {
              type: 'mrkdwn',
              text: value.desk + ' reserved by @' + value.user
            }]
        }
      ));
    }
    return roomsBlocks;
  })));
  return {
    channel: `@${channel}`,
    blocks: blocks
  };
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
      const reservedDesksInRooms = new Map<string, any[]>();
      reserved.forEach(r => {
        if (reservedDesksInRooms.get(r.data().room) == undefined) {
          reservedDesksInRooms.set(r.data().room, []);
        }
        reservedDesksInRooms.get(r.data().room).push(
          {
            desk: r.data().desk,
            user: r.data().userName
          });
      });
      const message = createMessage(reservedDesksInRooms, payload.userName, payload.date);
      await sendSlackMessage(slackHttpHeaders, payload.responseUrl, JSON.stringify(message));
    });
};
