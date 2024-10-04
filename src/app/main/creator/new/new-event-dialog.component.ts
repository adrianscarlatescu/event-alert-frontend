import {Component, OnInit} from '@angular/core';
import {EventTag} from '../../../model/event.tag';
import {Event} from '../../../model/event';
import {EventSeverity} from '../../../model/event.severity';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FileService} from '../../../service/file.service';
import {SessionService} from '../../../service/session.service';
import {EventService} from '../../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MatDialogRef} from '@angular/material/dialog';
import {SpinnerService} from '../../../shared/spinner/spinner.service';
import {EventRequest} from '../../../model/request/event.request';
import {EVENT_IMAGE_FILE_PREFIX, MAX_DESCRIPTION_LENGTH} from '../../../defaults/constants';
import {User} from '../../../model/user';
import {
  ERR_MSG_DESCRIPTION_LENGTH,
  ERR_MSG_IMAGE_REQUIRED,
  ERR_MSG_PROFILE_FIRST_NAME_REQUIRED,
  ERR_MSG_PROFILE_LAST_NAME_REQUIRED,
  ERR_MSG_PROFILE_PHONE_NUMBER_REQUIRED,
  ERR_MSG_SEVERITY_REQUIRED,
  ERR_MSG_TAG_REQUIRED
} from '../../../defaults/field-validation-messages';

@Component({
  selector: 'app-new-event-dialog',
  templateUrl: './new-event-dialog.component.html',
  styleUrls: ['./new-event-dialog.component.css']
})
export class NewEventDialogComponent implements OnInit {

  latitude: number;
  longitude: number;

  file: File;
  eventImage: SafeUrl;

  tags: EventTag[] = [];
  severities: EventSeverity[] = [];

  newEventForm: FormGroup;

  newEvent: Event;

  constructor(private formBuilder: FormBuilder,
              private fileService: FileService,
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

    this.newEventForm = this.formBuilder.group({
      tag: [undefined, Validators.required],
      severity: [undefined, Validators.required],
      description: [undefined, Validators.maxLength(MAX_DESCRIPTION_LENGTH)]
    });
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
    const url: string = this.sessionService.getCacheImageByUrl(imagePath).toString();
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  onSaveClicked(): void {
    if (this.newEventForm.invalid) {
      this.toast.error('Invalid form');
      this.newEventForm.markAsTouched();
      return;
    }
    if (!this.file) {
      this.toast.error(ERR_MSG_IMAGE_REQUIRED);
      return;
    }

    const user: User = this.sessionService.getUser();
    let userRequiredDataErrorMessage: string = '';
    if (!user.firstName) {
      userRequiredDataErrorMessage += ERR_MSG_PROFILE_FIRST_NAME_REQUIRED;
    }
    if (!user.lastName) {
      if (userRequiredDataErrorMessage) {
        userRequiredDataErrorMessage += '<hr/>';
      }
      userRequiredDataErrorMessage += ERR_MSG_PROFILE_LAST_NAME_REQUIRED;
    }
    if (!user.phoneNumber) {
      if (userRequiredDataErrorMessage) {
        userRequiredDataErrorMessage += '<hr/>';
      }
      userRequiredDataErrorMessage += ERR_MSG_PROFILE_PHONE_NUMBER_REQUIRED;
    }
    if (userRequiredDataErrorMessage) {
      this.toast.error(userRequiredDataErrorMessage, '',{enableHtml: true});
      return;
    }

    this.spinnerService.show();
    this.fileService.postImage(this.file, EVENT_IMAGE_FILE_PREFIX)
      .subscribe(imagePath => {
        const eventRequest: EventRequest = new EventRequest();
        eventRequest.latitude = this.latitude;
        eventRequest.longitude = this.longitude;
        eventRequest.userId = this.sessionService.getUser().id;
        eventRequest.tagId = this.newEventForm.get('tag').value;
        eventRequest.severityId = this.newEventForm.get('severity').value;
        eventRequest.imagePath = imagePath.toString();
        eventRequest.description = this.newEventForm.get('description').value;

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
    if (this.newEventForm.get('tag').hasError('required')) {
      return ERR_MSG_TAG_REQUIRED;
    }
  }

  getSeverityErrorMessage(): string {
    if (this.newEventForm.get('severity').hasError('required')) {
      return ERR_MSG_SEVERITY_REQUIRED;
    }
  }

  getDescriptionErrorMessage(): string {
    if (this.newEventForm.get('description').hasError('maxlength')) {
      return ERR_MSG_DESCRIPTION_LENGTH;
    }
  }

}
