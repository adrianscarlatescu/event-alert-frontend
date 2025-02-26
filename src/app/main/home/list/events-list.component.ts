import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {SessionService} from '../../../service/session.service';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {

  @Output() pageEventEmitter: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Input()
  events: EventDto[];
  @Input()
  length: number;
  @Input()
  index: number;

  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius', 'distance'];

  constructor(private router: Router,
              public sessionService: SessionService) {
    this.length = 0;
  }

  ngOnInit(): void {
  }

  onRowClicked(eventId: number): void {
    this.router.navigate(['event', eventId]);
  }

  onPageChanged(pageEvent: PageEvent): void {
    this.pageEventEmitter.emit(pageEvent);
  }

}
