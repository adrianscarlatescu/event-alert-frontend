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
import {UserService} from '../../service/user.service';
import {concatMap, tap} from 'rxjs/operators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {FileService} from '../../service/file.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.css']
})
export class ReporterComponent implements OnInit {

  isDataLoaded: boolean = false;

  dataSource: MatTableDataSource<EventDto> = new MatTableDataSource([]);
  displayedColumns: string[] = ['thumbnail', 'type', 'severity', 'status', 'createdAt', 'impactRadius'];

  userLocation: UserLocation;
  typeImages: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  constructor(private eventService: EventService,
              private sessionService: SessionService,
              private fileService: FileService,
              private userService: UserService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private domSanitizer: DomSanitizer,
              private dialog: MatDialog,
              private router: Router) {

  }

  ngOnInit(): void {
    this.sessionService.getUserLocation()
      .subscribe(userLocation => this.userLocation = userLocation);

    this.spinnerService.show();
    this.userService.getProfile()
      .pipe(concatMap(user => {
        return this.eventService.getEventsByUserId(user.id);
      }))
      .pipe(concatMap(events => {
        this.dataSource.data = events;

        return forkJoin(events
          .map(event => event.type.imagePath)
          .filter((value, index, array) => array.indexOf(value) === index)
          .map(imagePath => {
          return this.fileService.getImage(imagePath)
            .pipe(tap(blob => {
              const url: string = URL.createObjectURL(blob);
              this.typeImages.set(imagePath, this.domSanitizer.bypassSecurityTrustUrl(url));
            }));
        }));
      }))
      .subscribe(() => {
        this.isDataLoaded = true;
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  onRowClicked(eventId: number): void {
    this.router.navigate(['event', eventId]);
  }

  onNewEventClicked(): void {
    if (!this.userLocation) {
      this.toast.warning('Location not provided');
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
