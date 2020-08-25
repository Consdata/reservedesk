import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import {FunctionBuilder} from 'firebase-functions';
import {reserveDeskFactory} from './app/reserve-desk.handler';
import {PubSub} from '@google-cloud/pubsub';
import {showFreeFactory} from './app/show-free/show-free.handler';
import {reserveFactory} from './app/reserve/reserve.handler';
import {reserveInteractionFactory} from './app/reserve/reserve-interaction.handler';
import {cancelFactory} from './app/cancel/cancel.handler';

firebase.initializeApp();

const region = functions.region('europe-west3');
const functionBuilder: () => FunctionBuilder = () => region
  .runWith({
    maxInstances: 5,
    memory: '256MB'
  });

export const reserveDesk = reserveDeskFactory(functionBuilder(), functions.config(), new PubSub());
export const reserveInteraction = reserveInteractionFactory(functionBuilder(), functions.config(), new PubSub());
export const showFree = showFreeFactory(functionBuilder(), functions.config(), firebase);
export const reserve = reserveFactory(functionBuilder(), functions.config(), firebase);
export const cancel = cancelFactory(functionBuilder(), functions.config(), firebase);
