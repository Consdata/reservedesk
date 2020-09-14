import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import {FunctionBuilder} from 'firebase-functions';
import {reserveDeskFactory} from './app/reserve-desk.handler';
import {reserveInteractionFactory} from './app/reserve-interaction.handler';

firebase.initializeApp();

const region = functions.region('europe-west3');
const functionBuilder: () => FunctionBuilder = () => region
  .runWith({
    maxInstances: 5,
    memory: '256MB'
  });

const firestore = firebase.firestore();

export const reserveDesk = reserveDeskFactory(functionBuilder(), functions.config());
export const reserveInteraction = reserveInteractionFactory(functionBuilder(), functions.config(), firestore);
