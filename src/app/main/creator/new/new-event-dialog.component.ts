import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EventTag} from '../../../model/event.tag';
import {Event} from '../../../model/event';
import {EventSeverity} from '../../../model/event.severity';
import {FormControl, Validators} from '@angular/forms';
import {FileService} from '../../../service/file.service';
import {SessionService} from '../../../service/session.service';
import {EventService} from '../../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MatDialogRef} from '@angular/material/dialog';
import {SpinnerService} from '../../../shared/spinner/spinner.service';
import {EventRequest} from '../../../model/request/event.request';

@Component({
  selector: 'app-new-event-dialog',
  templateUrl: './new-event-dialog.component.html',
  styleUrls: ['./new-event-dialog.component.css']
})
export class NewEventDialogComponent implements OnInit {
  @ViewChild('newEventDescriptionTextArea') descriptionElementRef: ElementRef;

  latitude: number;
  longitude: number;

  file: File;
  eventImage: SafeUrl;

  tags: EventTag[] = [];
  severities: EventSeverity[] = [];

  tagControl: FormControl;
  severityControl: FormControl;

  newEvent: Event;

  constructor(private fileService: FileService,
              private sessionService: SessionService,
              private eventService: EventService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private domSanitizer: DomSanitizer,
              private dialogRef: MatDialogRef<NewEventDialogComponent>) {

    this.latitude = this.sessionService.getUserLatitude();
    this.longitude = this.sessionService.getUserLongitude();

    if (!this.latitude || !this.longitude) {
      console.log('Location not provided');
      this.dialogRef.close();
      return;
    }

    this.tags = sessionService.getTags().sort((a, b) => a.name.localeCompare(b.name));
    this.severities = sessionService.getSeverities();

    this.tagControl = new FormControl(undefined, Validators.required);
    this.severityControl = new FormControl(undefined, Validators.required);
  }

  ngOnInit(): void {

  }

  onImageChanged(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      const url: string = URL.createObjectURL(this.file);
      this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
    }
  }

  getImage(imagePath: string): SafeUrl {
    if (!imagePath) {
      return '../../../../assets/favicon.png';
    }
    const url: string = this.sessionService.getCacheImageByUrl(imagePath).toString();
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  onSaveClicked(): void {
    if (this.tagControl.invalid || this.severityControl.invalid) {
      this.toast.warning('Invalid form');
      this.tagControl.markAsTouched();
      this.severityControl.markAsTouched();
      return;
    }
    if (!this.file) {
      this.toast.warning('Image not selected');
      return;
    }

    this.spinnerService.show();
    this.fileService.postImage(this.file, 'event_')
      .subscribe(imagePath => {
        const eventRequest: EventRequest = new EventRequest();
        eventRequest.latitude = this.latitude;
        eventRequest.longitude = this.longitude;
        eventRequest.userId = this.sessionService.getUser().id;
        eventRequest.tagId = this.tagControl.value;
        eventRequest.severityId = this.severityControl.value;
        eventRequest.imagePath = imagePath.toString();
        eventRequest.description = this.descriptionElementRef.nativeElement.value;

        this.eventService.postEvent(eventRequest)
          .subscribe(event => {
            this.toast.success('Event successfully reported');
            this.newEvent = event;
            this.dialogRef.close();
            this.spinnerService.close();
          }, () => this.spinnerService.close());
      });
  }

  getTagErrorMessage(): string {
    if (this.tagControl.hasError('required')) {
      return 'The tag is required';
    }
  }

  getSeverityErrorMessage(): string {
    if (this.severityControl.hasError('required')) {
      return 'The severity is required';
    }
  }

}
