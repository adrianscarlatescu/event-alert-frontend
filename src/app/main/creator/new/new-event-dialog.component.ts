import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EventTag} from '../../../model/event.tag';
import {Event} from '../../../model/event';
import {EventSeverity} from '../../../model/event.severity';
import {FormControl, Validators} from '@angular/forms';
import {FileService} from '../../../service/file.service';
import {SessionService} from '../../../service/session.service';
import {EventService} from '../../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer} from '@angular/platform-browser';
import {NewEventBody} from '../../../service/body/new.event.body';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-new-event-dialog',
  templateUrl: './new-event-dialog.component.html',
  styleUrls: ['./new-event-dialog.component.css']
})
export class NewEventDialogComponent implements OnInit {
  @ViewChild('newEventDescriptionTextArea') description: ElementRef;

  latitude: number;
  longitude: number;

  file: File;
  eventImage;

  tags: EventTag[] = [];
  severities: EventSeverity[] = [];

  tagControl: FormControl;
  severityControl: FormControl;

  newEvent: Event;

  constructor(private fileService: FileService,
              private sessionService: SessionService,
              private eventService: EventService,
              private toast: ToastrService,
              private domSanitizer: DomSanitizer,
              private dialogRef: MatDialogRef<NewEventDialogComponent>) {

    this.latitude = this.sessionService.getLatitude();
    this.longitude = this.sessionService.getLongitude();

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

  onImageChanged(event): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      const url = URL.createObjectURL(this.file);
      this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
    }
  }

  getImage(imagePath: string) {
    if (!imagePath) {
      return '../../../../assets/favicon.png';
    }
    const url: string = this.sessionService.getCacheImageByUrl(imagePath).toString();
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  onSaveClicked() {
    if (this.tagControl.invalid || this.severityControl.invalid) {
      this.toast.warning('Conditions not met');
      return;
    }
    if (!this.file) {
      this.toast.warning('Image not selected');
      return;
    }

    this.fileService.postImage(this.file, 'event_')
      .subscribe(imagePath => {
        const body = new NewEventBody();
        body.latitude = this.latitude;
        body.longitude = this.longitude;
        body.userId = this.sessionService.getUser().id;
        body.tagId = this.tagControl.value;
        body.severityId = this.severityControl.value;
        body.imagePath = imagePath.toString();
        body.description = this.description.nativeElement.value;

        this.eventService.postEvent(body)
          .subscribe(event => {
            if (event) {
              this.toast.success('Event successfully reported');
              this.newEvent = event;
              this.dialogRef.close();
            }
          });
      });
  }

  getTagErrorMessage() {
    if (this.tagControl.hasError('required')) {
      return 'The tag is required';
    }
  }

  getSeverityErrorMessage() {
    if (this.severityControl.hasError('required')) {
      return 'The severity is required';
    }
  }

}
