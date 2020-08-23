import {Command} from './command';

export interface ReserveDeskMessage {
  command: Command;
  date: string;
  room?: string;
  desk?: string;
  userName: string;
}
