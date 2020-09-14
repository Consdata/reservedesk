import {updateModalSlackMessage} from '../slack/send-slack-message';
import {createShowFreeRoomsMessage} from './show-free-rooms-message.creator';
import * as admin from 'firebase-admin';

export const showFreeRooms = async (slackHttpHeaders,
                                    firestore: admin.firestore.Firestore,
                                    userName: string,
                                    date: string,
                                    triggerId: string,
                                    viewId?: string) => {
  const message = await createShowFreeRoomsMessage(firestore, userName, date, triggerId, viewId);
  await updateModalSlackMessage(slackHttpHeaders, JSON.stringify(message));
};
