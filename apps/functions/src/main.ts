import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import {FunctionBuilder} from 'firebase-functions';
import {reserveDeskFactory} from './app/reserve-desk.handler';
import {reserveInteractionFactory} from './app/reserve/reserve-interaction.handler';

firebase.initializeApp();

const region = functions.region('europe-west3');
const functionBuilder: () => FunctionBuilder = () => region
  .runWith({
    maxInstances: 5,
    memory: '256MB'
  });

export const reserveDesk = reserveDeskFactory(functionBuilder(), functions.config(), firebase);
export const reserveInteraction = reserveInteractionFactory(functionBuilder(), functions.config(), firebase);
