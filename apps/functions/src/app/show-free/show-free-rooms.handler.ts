import {sendModalSlackMessage, updateModalSlackMessage} from '../slack/send-slack-message';
import {createShowFreeRoomsMessage} from './show-free-rooms-message.creator';
import * as admin from 'firebase-admin';

export const showFreeRooms = async (slackHttpHeaders,
                                    firestore: admin.firestore.Firestore,
                                    userName: string,
                                    date: string,
                                    triggerId: string,
                                    viewId?: string) => {
  console.log('2', new Date());
  const message = await createShowFreeRoomsMessage(firestore, userName, date, triggerId, viewId);
  console.log('7', new Date());
  // console.log('message:', JSON.stringify(message));
  await updateModalSlackMessage(slackHttpHeaders, JSON.stringify(message));
  console.log('8', new Date());
};
