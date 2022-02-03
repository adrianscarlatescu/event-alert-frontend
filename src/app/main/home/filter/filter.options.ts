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
    this.startDate = new Date(Date.now());
    this.startDate.setFullYear(2020);
    this.startDate.setMonth(0);
    this.startDate.setDate(1);

    this.endDate = new Date(Date.now());
    this.endDate.setFullYear(2020);
    this.endDate.setMonth(11);
    this.endDate.setDate(31);
  }

}
