import {EventTag} from '../../../model/event.tag';
import {EventSeverity} from '../../../model/event.severity';

export class FilterOptions {

  radius: number;
  startDate: Date;
  endDate: Date;
  tags: EventTag[];
  severities: EventSeverity[];

  constructor() {
    this.radius = 1000;
    this.tags = [];
    this.severities = [];

    // Cover the events recorded in the database
    this.startDate = new Date(2020, 0, 1);
    this.endDate = new Date(2020, 11, 31);
  }

}
