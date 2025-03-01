import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {SessionService} from '../../../service/session.service';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {forkJoin} from 'rxjs';
import {tap} from 'rxjs/operators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

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

  typeImages: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius', 'distance'];

  constructor(private router: Router,
              public sessionService: SessionService,
              private fileService: FileService,
              private domSanitizer: DomSanitizer) {
    this.length = 0;
  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    if (!this.events || this.events.length === 0) {
      return;
    }

    forkJoin(this.events
      .map(event => event.type.imagePath)
      .filter((value, index, array) => array.indexOf(value) === index)
      .map(imagePath => {
        return this.fileService.getImage(imagePath)
          .pipe(tap(blob => {
            const url: string = URL.createObjectURL(blob);
            this.typeImages.set(imagePath, this.domSanitizer.bypassSecurityTrustUrl(url));
          }));
      }))
      .subscribe();
  }

  onRowClicked(eventId: number): void {
    this.router.navigate(['event', eventId]);
  }

  onPageChanged(pageEvent: PageEvent): void {
    this.pageEventEmitter.emit(pageEvent);
  }

}
