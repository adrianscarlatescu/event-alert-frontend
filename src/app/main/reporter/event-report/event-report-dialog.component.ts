import {Component, Inject, OnInit} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {SeverityDto} from '../../../model/severity.dto';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FileService} from '../../../service/file.service';
import {SessionService} from '../../../service/session.service';
import {EventService} from '../../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IMPACT_RADIUS_PATTERN, LENGTH_1000, MAX_IMPACT_RADIUS, MIN_IMPACT_RADIUS} from '../../../defaults/constants';
import {UserDto} from '../../../model/user.dto';
import {
  ERR_MSG_DESCRIPTION_LENGTH,
  ERR_MSG_IMAGE_REQUIRED,
  ERR_MSG_IMPACT_RADIUS_DECIMALS,
  ERR_MSG_MAX_IMPACT_RADIUS,
  ERR_MSG_MIN_IMPACT_RADIUS,
  ERR_MSG_PROFILE_FULL_NAME_REQUIRED,
  ERR_MSG_SEVERITY_REQUIRED,
  ERR_MSG_STATUS_REQUIRED,
  ERR_MSG_TYPE_REQUIRED
} from '../../../defaults/field-validation-messages';
import {TypeDto} from '../../../model/type.dto';
import {EventCreateDto} from '../../../model/event-create.dto';
import {StatusDto} from '../../../model/status.dto';
import {ImageType} from '../../../enums/image-type';
import {mergeMap} from 'rxjs/operators';
import {SpinnerService} from '../../../service/spinner.service';
import {UserLocation} from '../../../types/user-location';

@Component({
  selector: 'app-event-report-dialog',
  templateUrl: './event-report-dialog.component.html',
  styleUrls: ['./event-report-dialog.component.css']
})
export class EventReportDialogComponent implements OnInit {

  userLocation: UserLocation;

  file: File;
  eventImage: SafeUrl;

  types: TypeDto[] = [];
  severities: SeverityDto[] = [];
  statuses: StatusDto[] = [];

  newEventForm: FormGroup;
  newEvent: EventDto;

  constructor(private formBuilder: FormBuilder,
              private fileService: FileService,
              private sessionService: SessionService,
              private eventService: EventService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private domSanitizer: DomSanitizer,
              private dialogRef: MatDialogRef<EventReportDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: UserLocation) {

    this.userLocation = data;

    this.types = sessionService.getTypes().sort((a, b) => a.label.localeCompare(b.label)); // TODO
    this.severities = sessionService.getSeverities();
    this.statuses = sessionService.getStatuses();

    this.newEventForm = this.formBuilder.group({
      severity: [undefined, Validators.required],
      type: [undefined, Validators.required],
      status: [undefined, Validators.required],
      impactRadius: [undefined, [Validators.min(MIN_IMPACT_RADIUS), Validators.max(MAX_IMPACT_RADIUS), Validators.pattern(IMPACT_RADIUS_PATTERN)]],
      description: [undefined, Validators.maxLength(LENGTH_1000)]
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

    const user: UserDto = this.sessionService.getUser();
    if (!user.firstName || !user.lastName) {
      this.toast.error(ERR_MSG_PROFILE_FULL_NAME_REQUIRED, '',{enableHtml: true});
      return;
    }

    this.spinnerService.show();
    this.fileService.postImage(this.file, ImageType.EVENT)
      .pipe(mergeMap(imagePath => {
        const eventCreate: EventCreateDto = {
          latitude: this.userLocation.latitude,
          longitude: this.userLocation.longitude,
          typeId: this.newEventForm.get('type').value,
          severityId: this.newEventForm.get('severity').value,
          statusId: this.newEventForm.get('status').value,
          impactRadius: this.newEventForm.get('impactRadius').value,
          userId: this.sessionService.getUser().id,
          imagePath: imagePath.toString(),
          description: this.newEventForm.get('description').value
        };
        return this.eventService.postEvent(eventCreate);
      }))
      .subscribe(event => {
        this.toast.success('Event successfully reported');
        this.newEvent = event;
        this.dialogRef.close();
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  getSeverityErrorMessage(): string {
    if (this.newEventForm.get('severity').hasError('required')) {
      return ERR_MSG_SEVERITY_REQUIRED;
    }
  }

  getTypeErrorMessage(): string {
    if (this.newEventForm.get('type').hasError('required')) {
      return ERR_MSG_TYPE_REQUIRED;
    }
  }

  getStatusErrorMessage(): string {
    if (this.newEventForm.get('status').hasError('required')) {
      return ERR_MSG_STATUS_REQUIRED;
    }
  }

  getImpactRadiusErrorMessage(): string {
    if (this.newEventForm.get('impactRadius').hasError('min')) {
      return ERR_MSG_MIN_IMPACT_RADIUS;
    }
    if (this.newEventForm.get('impactRadius').hasError('max')) {
      return ERR_MSG_MAX_IMPACT_RADIUS;
    }
    if (this.newEventForm.get('impactRadius').hasError('pattern')) {
      return ERR_MSG_IMPACT_RADIUS_DECIMALS;
    }
  }

  getDescriptionErrorMessage(): string {
    if (this.newEventForm.get('description').hasError('maxlength')) {
      return ERR_MSG_DESCRIPTION_LENGTH;
    }
  }

}
