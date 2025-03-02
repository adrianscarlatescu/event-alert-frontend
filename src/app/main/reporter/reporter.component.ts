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
import {UserLocation} from '../../types/user-location';
import {SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.css']
})
export class ReporterComponent implements OnInit {

  dataSource: MatTableDataSource<EventDto> = new MatTableDataSource([]);
  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius'];

  userLocation: UserLocation;

  constructor(private sessionService: SessionService,
              private eventService: EventService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private dialog: MatDialog,
              private router: Router) {

  }

  ngOnInit(): void {
    this.sessionService.getUserLocation()
      .subscribe(userLocation => this.userLocation = userLocation);

    this.spinnerService.show();
    this.eventService.getEventsByUserId(this.sessionService.getConnectedUser().id)
      .subscribe(events => {
        this.dataSource.data = events;
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
  }

  onRowClicked(eventId: number): void {
    this.router.navigate(['event', eventId]);
  }

  onNewEventClicked(): void {
    if (!this.userLocation) {
      this.toastrService.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<EventReportDialogComponent> = this.dialog.open(EventReportDialogComponent, {
      data: this.userLocation
    });
    dialogRef.afterClosed().subscribe(() => {
      const newEvent: EventDto = dialogRef.componentInstance.newEvent;
      if (!newEvent) {
        return;
      }

      const events: EventDto[] = this.dataSource.data;
      events.unshift(newEvent);
      this.dataSource.data = events;
    });
  }

}
