import {UserBaseDto} from './user-base.dto';

export type CommentDto = {

  id: number;
  createdAt: Date;
  modifiedAt: Date;
  comment: string;
  user: UserBaseDto;

}
