import {roomsDefinitions} from './rooms-definitions';
import * as admin from 'firebase-admin';

const NUMBER_OF_DAYS_TO_SHOW = 14;

function createMessage(reservedDesksInDays: Map<string, any[]>, userName: string, date: string, triggerId: string, viewId: string) {
  const deskReservedBy = (roomName: string, deskName: string): string => {
    if (reservedDesksInDays.get(roomName) != undefined) {
      const reservation = reservedDesksInDays.get(roomName).filter((value) => value.desk === deskName).pop();
      return reservation != undefined ? reservation.user : undefined;
    }
    return undefined;
  };

  let blocks = [];
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Please select one desk for *${date}*:`
    }
  });
  blocks = blocks.concat(...(roomsDefinitions.map((def) => {
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
      });
    def.desks.forEach(desk => {
      const reservedBy = deskReservedBy(def.name, desk.name);
      roomsBlocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*' + desk.name + '* _' + desk.dockStation + '_' + (reservedBy != undefined ? ' :no_entry: reserved by @' + reservedBy : '')
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: false,
              text: reservedBy === userName ? 'Cancel' : 'Reserve'
            },
            value: date + '_' + def.name + '_' + desk.name,
            style: reservedBy != undefined ? 'danger' : 'primary',
            action_id: 'reserve'
          }
        }
      )
    });
    return roomsBlocks;
  })));
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
        text: 'Done'
      },
      blocks: blocks
    },
    view_id: viewId
  }
}

function generateDatesArray(): string[] {
  const date = new Date(new Date().getTime() + 7200000);
  const result = [];
  for (let i = 0; i < NUMBER_OF_DAYS_TO_SHOW; i++) {
    result.push(date.toISOString().slice(0,10));
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export const createShowFreeDatesMessage = async (firestore: admin.firestore.Firestore,
                                                 userName: string,
                                                 room: string,
                                                 triggerId: string,
                                                 viewId?: string) => {
  const reservationsRef = firestore.collection('reservationDesk');
  const reserved = await reservationsRef
    .where('room', '==', room)
    .where('date', 'in', generateDatesArray)
    .orderBy('date')
    .orderBy('desk')
    .get();
  const reservedDesksInDays = new Map<string, any[]>();
  reserved.forEach(r => {
    if (reservedDesksInDays.get(r.data().date) == undefined) {
      reservedDesksInDays.set(r.data().date, []);
    }
    reservedDesksInDays.get(r.data().date).push(
      {
        desk: r.data().desk,
        user: r.data().userName
      });
  });
  return createMessage(reservedDesksInDays, userName, room, triggerId, viewId);
};
