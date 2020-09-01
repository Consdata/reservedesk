import {roomsDefinitions} from './rooms-definitions';

function createMessage(reservedDesksInRooms: Map<string, any[]>, channel: string, date: string, triggerId: string, viewId: string) {
  const deskReservedBy = (roomName: string, deskName: string): string => {
    if (reservedDesksInRooms.get(roomName) != undefined) {
      const reservation = reservedDesksInRooms.get(roomName).filter((value) => value.desk === deskName).pop();
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
              text: 'Reserve'
            },
            value: date + '_' + def.name + '_' + desk.name,
            style: reservedBy != undefined ? 'danger' : 'primary'
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
      blocks: blocks
    },
    view_id: viewId
  }
}

export const createDesksViewMessage = async (firebase: typeof import('firebase-admin'),
                                             userName: string,
                                             date: string,
                                             triggerId: string,
                                             viewId?: string) => {
  const firestore = firebase.firestore();
  const reservationsRef = firestore.collection('reservationDesk');
  const reserved = await reservationsRef
    .where('date', '==', date)
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
  return createMessage(reservedDesksInRooms, userName, date, triggerId, viewId);
};
