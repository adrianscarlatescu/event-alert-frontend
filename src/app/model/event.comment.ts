import {UserBase} from './user.base';

export interface EventComment {
  id: number;
  dateTime: Date;
  comment: string;
  user: UserBase;
}
