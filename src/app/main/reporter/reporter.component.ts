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
import {EventCreateDto} from '../../model/event-create.dto';
import {mergeMap} from 'rxjs/operators';
import {ImageType} from '../../enums/image-type';
import {EventReport} from '../../types/event-report';
import {FileService} from '../../service/file.service';
import {UserDto} from '../../model/user.dto';
import {ERR_MSG_PROFILE_FULL_NAME_REQUIRED} from '../../defaults/field-validation-messages';

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.css']
})
export class ReporterComponent implements OnInit {

  dataSource: MatTableDataSource<EventDto> = new MatTableDataSource([]);
  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius'];

  connectedUser: UserDto;
  userLocation: UserLocation;

  constructor(private sessionService: SessionService,
              private fileService: FileService,
              private eventService: EventService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private dialog: MatDialog,
              private router: Router) {

  }

  ngOnInit(): void {
    this.connectedUser = this.sessionService.getConnectedUser();

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

    if (!this.connectedUser.firstName || !this.connectedUser.lastName) {
      this.toastrService.error(ERR_MSG_PROFILE_FULL_NAME_REQUIRED, '',{enableHtml: true});
      return;
    }

    const dialogRef: MatDialogRef<EventReportDialogComponent> = this.dialog.open(EventReportDialogComponent, {
      autoFocus: false
    });

    dialogRef.componentInstance.onValidate.subscribe((newEvent: EventReport) => {
      this.spinnerService.show();
      this.fileService.postImage(newEvent.image, ImageType.EVENT)
        .pipe(mergeMap(imagePath => {
          const eventCreate: EventCreateDto = {
            latitude: this.userLocation.latitude,
            longitude: this.userLocation.longitude,
            typeId: newEvent.typeId,
            severityId: newEvent.severityId,
            statusId: newEvent.statusId,
            impactRadius: newEvent.impactRadius,
            userId: this.connectedUser.id,
            imagePath: imagePath.toString(),
            description: newEvent.description
          };
          return this.eventService.postEvent(eventCreate);
        }))
        .subscribe(event => {
          dialogRef.componentInstance.close();

          this.toastrService.success('Event successfully reported');
          this.spinnerService.close();

          const events: EventDto[] = this.dataSource.data;
          events.unshift(event);
          this.dataSource.data = events;
        }, () => this.spinnerService.close());

    });
  }

}
