import {User} from './user';

export interface EventComment {
  id: number;
  dateTime: Date;
  comment: string;
  user: User;
}
