import {updateModalSlackMessage} from '../slack/send-slack-message';
import {createShowFreeDatesMessage} from './show-free-dates-message.creator';
import * as admin from 'firebase-admin';

export const showFreeDatesForRoom = async (slackHttpHeaders,
                                           firestore: admin.firestore.Firestore,
                                           userName: string,
                                           room: string,
                                           triggerId: string,
                                           viewId?: string) => {
  const message = await createShowFreeDatesMessage(firestore, userName, room, triggerId, viewId);
  await updateModalSlackMessage(slackHttpHeaders, JSON.stringify(message));
};
