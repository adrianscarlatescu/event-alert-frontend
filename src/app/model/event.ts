import {EventSeverity} from './event.severity';
import {EventTag} from './event.tag';
import {User} from './user';

export class Event {
  id: number;
  dateTime: Date;
  latitude: number;
  longitude: number;
  imagePath: string;
  description: string;
  severity: EventSeverity;
  tag: EventTag;
  user: User;
  distance: number;
}
