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
    this.endDate = new Date(Date.now());
    this.startDate = new Date(Date.now());
    this.startDate.setFullYear((this.endDate.getFullYear() - 1));
    this.startDate.setMonth(0);
    this.startDate.setDate(1);
    this.tags = [];
    this.severities = [];
  }

}
