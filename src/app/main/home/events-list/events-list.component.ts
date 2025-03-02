import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {SessionService} from '../../../service/session.service';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit, OnChanges {

  @Output() pageEventEmitter: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Input()
  events: EventDto[];
  @Input()
  length: number;
  @Input()
  index: number;

  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius', 'distance'];

  constructor(private sessionService: SessionService,
              private router: Router) {
    this.length = 0;
  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    if (!this.events || this.events.length === 0) {
      return;
    }
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
  }

  onRowClicked(eventId: number): void {
    this.router.navigate(['event', eventId]);
  }

  onPageChanged(pageEvent: PageEvent): void {
    this.pageEventEmitter.emit(pageEvent);
  }

}
