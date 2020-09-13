import {updateModalSlackMessage} from '../slack/send-slack-message';
import {ReserveDesk} from '../reserve-desk';
import * as admin from 'firebase-admin';
import {createShowFreeRoomsMessage} from '../show-free/show-free-rooms-message.creator';

function extractReserveDeskData(actionValue: string): ReserveDesk {
  return {
    date: actionValue.substr(0, 10),
    room: actionValue.substring(11, actionValue.lastIndexOf('_')),
    desk: actionValue.substr(actionValue.lastIndexOf('_') + 1)
  }
}

export const reserveDesk = async (slackHttpHeaders,
                                  firestore: admin.firestore.Firestore,
                                  userName: string,
                                  actionValue: string,
                                  triggerId: string,
                                  viewId: string) => {
  const reserveDeskData = extractReserveDeskData(actionValue);

  const docId = reserveDeskData.date.concat(reserveDeskData.room).concat(reserveDeskData.desk);
  const reservationRef = firestore.collection('reservationDesk').doc(docId);
  const reserved = await reservationRef.get();
  if (!reserved.exists) {
    const result = await firestore.runTransaction(async t => {
      const reservation = await t.get(reservationRef);
      if (!reservation.exists) {
        await t.set(reservationRef, {
          date: reserveDeskData.date,
          room: reserveDeskData.room,
          desk: reserveDeskData.desk,
          userName: userName,
        });
        return true;
      } else {
        return false;
      }
    });
    if (result) {
      const desksViewMessage = await createShowFreeRoomsMessage(
        firestore,
        userName,
        reserveDeskData.date,
        triggerId,
        viewId);
      await updateModalSlackMessage(slackHttpHeaders, JSON.stringify(desksViewMessage));
    }
  }
};
