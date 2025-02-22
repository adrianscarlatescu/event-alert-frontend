import {SeverityDto} from './severity.dto';
import {UserBaseDto} from './user-base.dto';
import {TypeDto} from './type.dto';
import {StatusDto} from './status.dto';

export type EventDto = {

  id: number;
  createdAt: Date;
  modifiedAt: Date;
  latitude: number;
  longitude: number;
  impactRadius: number;
  type: TypeDto;
  severity: SeverityDto;
  status: StatusDto;
  user: UserBaseDto;
  imagePath: string;
  description: string;
  distance: number;

}
