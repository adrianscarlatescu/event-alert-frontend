import {Component, OnInit} from '@angular/core';
import {EventService} from '../../service/event.service';
import {SessionService} from '../../service/session.service';
import {Router} from '@angular/router';
import {EventDto} from '../../model/event.dto';
import {ToastrService} from 'ngx-toastr';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EventReportDialogComponent} from './event-report/event-report-dialog.component';
import {SpinnerService} from '../../service/spinner.service';

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.css']
})
export class ReporterComponent implements OnInit {

  dataSource: MatTableDataSource<Element> = new MatTableDataSource([]);
  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius'];

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
    this.router.navigate(['event', eventId]);
  }

  onNewEventClicked(): void {
    if (!this.sessionService.getUserLatitude() || !this.sessionService.getUserLongitude()) {
      this.toast.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<EventReportDialogComponent> = this.dialog.open(EventReportDialogComponent);
    dialogRef.afterClosed().subscribe(() => {
      const newEvent: EventDto = dialogRef.componentInstance.newEvent;
      if (!newEvent) {
        return;
      }

      const elements: Element[] = this.dataSource.data;
      elements.unshift(this.getElementFromEvent(newEvent));
      this.dataSource.data = elements;
    });
  }

  private getElementFromEvent(event: EventDto): Element {
    return {
      eventId: event.id,
      impactRadius: event.impactRadius,
      typeLabel: event.type.label,
      typeImagePath: event.type.imagePath,
      severityLabel: event.severity.label,
      severityColor: event.severity.color,
      statusLabel: event.status.label,
      statusColor: event.status.color,
      createdAt: event.createdAt
    };
  }

  getCacheImage(imagePath: string): string | ArrayBuffer {
    return this.sessionService.getCacheImageByUrl(imagePath);
  }

}

type Element = {

  eventId: number;
  impactRadius: number;
  typeLabel: string;
  typeImagePath: string;
  severityLabel: string;
  severityColor: string;
  statusLabel: string;
  statusColor: string;
  createdAt: Date;

}
