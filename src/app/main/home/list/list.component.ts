import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Event} from '../../../model/event';
import {SessionService} from '../../../service/session.service';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  @Output() pageEventEmitter = new EventEmitter<PageEvent>();

  events: Event[];
  length: number;
  index: number;
  displayedColumns: string[] = ['thumbnail', 'tag', 'severity', 'dateTime', 'distance'];

  constructor(private router: Router,
              public sessionService: SessionService) {
    this.length = 0;
  }

  ngOnInit(): void {
  }

  public setData(events: Event[], totalEvents: number, pageIndex: number) {
    this.events = events;
    this.length = totalEvents;
    this.index = pageIndex;
  }

  onRowClicked(index: number) {
    this.router.navigate(['event/details'], {state: {id: this.events[index].id}});
  }

  onPageChanged(pageEvent: PageEvent) {
    this.pageEventEmitter.emit(pageEvent);
  }

}
