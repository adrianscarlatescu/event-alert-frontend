import {Component, OnInit} from '@angular/core';
import {EventService} from '../../service/event.service';
import {SessionService} from '../../service/session.service';
import {Router} from '@angular/router';
import {Event} from '../../model/event';
import {ToastrService} from 'ngx-toastr';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NewEventDialogComponent} from './new/new-event-dialog.component';
import {SpinnerService} from '../../shared/spinner/spinner.service';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent implements OnInit {

  dataSource: MatTableDataSource<Element> = new MatTableDataSource([]);
  displayedColumns: string[] = ['thumbnail', 'tagName', 'severityName', 'dateTime'];

  constructor(private eventService: EventService,
              private sessionService: SessionService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private dialog: MatDialog,
              private router: Router) {

  }

  ngOnInit(): void {
    this.spinnerService.show();
    this.eventService.getEventsByUserId(this.sessionService.getUser().id)
      .subscribe(events => {
        const data: Element[] = [];
        events.map(event => {
          const element: Element = this.getElementFromEvent(event);
          data.push(element);
        });

        this.dataSource.data = data;
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  onRowClicked(eventId: number): void {
    this.router.navigate(['event/details'], {state: {id: eventId}});
  }

  onNewEventClicked(): void {
    if (!this.sessionService.getUserLatitude() || !this.sessionService.getUserLongitude()) {
      this.toast.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<NewEventDialogComponent> = this.dialog.open(NewEventDialogComponent);
    dialogRef.afterClosed().subscribe(() => {
      const newEvent: Event = dialogRef.componentInstance.newEvent;
      if (!newEvent) {
        return;
      }

      const elements: Element[] = this.dataSource.data;
      elements.unshift(this.getElementFromEvent(newEvent));
      this.dataSource.data = elements;
    });
  }

  private getElementFromEvent(event: Event): Element {
    const element: Element = new Element();
    element.eventId = event.id;
    element.tagName = event.tag.name;
    element.tagImagePath = event.tag.imagePath;
    element.severityName = event.severity.name;
    element.severityColor = event.severity.color;
    element.dateTime = event.dateTime;
    return element;
  }

  getCacheImage(imagePath: string): string | ArrayBuffer {
    return this.sessionService.getCacheImageByUrl(imagePath);
  }

}

class Element {

  eventId: number;
  tagName: string;
  tagImagePath: string;
  severityName: string;
  severityColor: number;
  dateTime: Date;

}
