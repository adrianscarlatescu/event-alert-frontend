import {Component, OnInit} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {SeverityDto} from '../../../model/severity.dto';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../../../service/session.service';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MatDialogRef} from '@angular/material/dialog';
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
import {StatusDto} from '../../../model/status.dto';
import {EventReport} from '../../../types/event-report';

@Component({
  selector: 'app-event-report-dialog',
  templateUrl: './event-report-dialog.component.html',
  styleUrls: ['./event-report-dialog.component.css']
})
export class EventReportDialogComponent implements OnInit {

  file: File;
  eventImage: SafeUrl;

  types: TypeDto[];
  severities: SeverityDto[];
  statuses: StatusDto[];

  newEventForm: FormGroup;
  newEvent: EventDto;

  connectedUser: UserDto;

  constructor(private sessionService: SessionService,
              private toastrService: ToastrService,
              private domSanitizer: DomSanitizer,
              private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<EventReportDialogComponent>) {

  }

  ngOnInit(): void {
    this.connectedUser = this.sessionService.getConnectedUser();
    this.types = this.sessionService.getTypes();
    this.severities = this.sessionService.getSeverities();
    this.statuses = this.sessionService.getStatuses();

    this.initForm();
  }

  initForm(): void {
    this.newEventForm = this.formBuilder.group({
      severity: [undefined, Validators.required],
      type: [undefined, Validators.required],
      status: [undefined, Validators.required],
      impactRadius: [undefined, [Validators.min(MIN_IMPACT_RADIUS), Validators.max(MAX_IMPACT_RADIUS), Validators.pattern(IMPACT_RADIUS_PATTERN)]],
      description: [undefined, Validators.maxLength(LENGTH_1000)]
    });
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
  }

  onImageChanged(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      const url: string = URL.createObjectURL(this.file);
      this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
    }
  }

  onValidateClicked(): void {
    if (this.newEventForm.invalid) {
      this.toastrService.error('Invalid form');
      this.newEventForm.markAsTouched();
      return;
    }
    if (!this.file) {
      this.toastrService.error(ERR_MSG_IMAGE_REQUIRED);
      return;
    }

    if (!this.connectedUser.firstName || !this.connectedUser.lastName) {
      this.toastrService.error(ERR_MSG_PROFILE_FULL_NAME_REQUIRED, '',{enableHtml: true});
      return;
    }

    const eventReport: EventReport = {
      image: this.file,
      typeId: this.newEventForm.get('type').value,
      severityId: this.newEventForm.get('severity').value,
      statusId: this.newEventForm.get('status').value,
      impactRadius: this.newEventForm.get('impactRadius').value,
      description: this.newEventForm.get('description').value
    };

    this.dialogRef.close(eventReport);
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
