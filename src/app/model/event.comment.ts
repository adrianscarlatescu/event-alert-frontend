import {User} from './user';

export class EventComment {
  id: number;
  dateTime: Date;
  comment: string;
  user: User;
}
