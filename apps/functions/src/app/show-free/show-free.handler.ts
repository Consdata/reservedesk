import {ReserveDeskMessage} from '../reserve-desk.message';
import * as nodeFetch from 'node-fetch';
import {DockStation} from './dock-station';

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
    name: 'Sharki',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215391975',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.new
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      },
      {
        name: 'B-4',
        dockStation: DockStation.old
      },
      {
        name: 'B-5',
        dockStation: DockStation.old
      }
    ]
  },
  {
    name: 'Piranie',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392024',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.new
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      },
      {
        name: 'B-4',
        dockStation: DockStation.new
      }
    ]
  },
  {
    name: 'Lemury',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392036',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      },
      {
        name: 'B-4',
        dockStation: DockStation.old
      }
    ]
  },
  {
    name: 'Komando',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392057',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.new
      },
      {
        name: 'B-2',
        dockStation: DockStation.old
      },
      {
        name: 'B-3',
        dockStation: DockStation.old
      },
      {
        name: 'B-4',
        dockStation: DockStation.old
      },
      {
        name: 'B-5',
        dockStation: DockStation.old
      }
    ]
  },
  {
    name: 'Orki',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392071',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      }
    ]
  },
  {
    name: 'Magicy',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392110',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.old
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      }
    ]
  },
  {
    name: 'Osy',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392129',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.unknown
      }
    ]
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
