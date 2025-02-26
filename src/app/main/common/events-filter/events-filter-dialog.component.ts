import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {SessionService} from '../../../service/session.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {SeverityDto} from '../../../model/severity.dto';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {MatSelectChange} from '@angular/material/select';
import {MAX_RADIUS, MAX_YEARS_INTERVAL, MIN_RADIUS} from '../../../defaults/constants';
import {
  ERR_MSG_DATES_YEARS_INTERVAL,
  ERR_MSG_END_DATE_AFTER_START_DATE,
  ERR_MSG_END_DATE_REQUIRED,
  ERR_MSG_MAX_RADIUS,
  ERR_MSG_MIN_RADIUS,
  ERR_MSG_MIN_SEVERITY_REQUIRED,
  ERR_MSG_MIN_STATUS_REQUIRED,
  ERR_MSG_MIN_TYPE_REQUIRED,
  ERR_MSG_RADIUS_REQUIRED,
  ERR_MSG_START_DATE_REQUIRED
} from '../../../defaults/field-validation-messages';
import {TypeDto} from '../../../model/type.dto';
import {StatusDto} from '../../../model/status.dto';
import {FilterOptions} from '../../../types/filter-options';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './events-filter-dialog.component.html',
  styleUrls: ['./events-filter-dialog.component.css']
})
export class EventsFilterDialogComponent implements OnInit {

  filterOptions: FilterOptions;
  filterForm: FormGroup;

  types: TypeDto[];
  withAllTypesSelected: boolean;

  severities: SeverityDto[];
  withAllSeveritiesSelected: boolean;

  statuses: StatusDto[];
  withAllStatusesSelected: boolean;

  isNewSearch: boolean;

  constructor(private sessionService: SessionService,
              private toast: ToastrService,
              private formBuilder: FormBuilder,
              private domSanitizer: DomSanitizer,
              private dialogRef: MatDialogRef<EventsFilterDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: FilterOptions) {

    this.filterOptions = data;
    this.isNewSearch = false;

    this.types = sessionService.getTypes().sort((a, b) => a.label.localeCompare(b.label));
    this.withAllTypesSelected = this.filterOptions.types.length === this.types.length;

    this.severities = sessionService.getSeverities();
    this.withAllSeveritiesSelected = this.filterOptions.severities.length === this.severities.length;

    this.statuses = sessionService.getStatuses();
    this.withAllStatusesSelected = this.filterOptions.statuses.length === this.statuses.length;

  }

  ngOnInit(): void {
    this.filterForm = this.formBuilder.group({
      radius: [this.filterOptions.radius, [Validators.required, Validators.min(MIN_RADIUS), Validators.max(MAX_RADIUS)]],
      selectedTypes: [this.types.filter(type =>
        this.filterOptions.types.find(filterType => filterType.id === type.id)), [Validators.required]],
      selectedSeverities: [this.severities.filter(severity =>
        this.filterOptions.severities.find(filterSeverity => filterSeverity.id === severity.id)), [Validators.required]],
      selectedStatuses: [this.statuses.filter(status =>
        this.filterOptions.statuses.find(filterStatus => filterStatus.id === status.id)), [Validators.required]],
      startDate: [this.filterOptions.startDate, [Validators.required]],
      endDate: [this.filterOptions.endDate, [Validators.required]],
    }, {
      validators: [DateValidator.validate]
    });
  }

  getImage(imagePath: string): SafeUrl {
    const url: string = this.sessionService.getCacheImageByUrl(imagePath).toString();
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  onSaveClicked(): void {
    if (this.filterForm.invalid) {
      this.toast.error('Invalid form');
      this.filterForm.markAsTouched();
      return;
    }

    this.filterOptions = {
      radius: this.filterForm.value.radius,
      startDate: this.filterForm.value.startDate,
      endDate: this.filterForm.value.endDate,
      types: this.filterForm.value.selectedTypes,
      severities: this.filterForm.value.selectedSeverities,
      statuses: this.filterForm.value.selectedStatuses
    }

    this.isNewSearch = true;

    this.dialogRef.close();
  }

  getRadiusErrorMessage(): string {
    const radius: AbstractControl = this.filterForm.get('radius');
    if (radius.hasError('required')) {
      return ERR_MSG_RADIUS_REQUIRED;
    }
    if (radius.hasError('min')) {
      return ERR_MSG_MIN_RADIUS;
    }
    if (radius.hasError('max')) {
      return ERR_MSG_MAX_RADIUS;
    }
  }

  getStartDateErrorMessage(): string {
    const startDate: AbstractControl = this.filterForm.get('startDate');
    if (startDate.hasError('required')) {
      return ERR_MSG_START_DATE_REQUIRED;
    }
  }

  getEndDateErrorMessage(): string {
    const endDate: AbstractControl = this.filterForm.get('endDate');
    if (endDate.hasError('required')) {
      return ERR_MSG_END_DATE_REQUIRED;
    }

    if (endDate.hasError('after')) {
      return ERR_MSG_END_DATE_AFTER_START_DATE;
    }

    if (endDate.hasError('year_limit')) {
      return ERR_MSG_DATES_YEARS_INTERVAL;
    }
  }

  getTypesErrorMessage(): string {
    const selectedTypes: AbstractControl = this.filterForm.get('selectedTypes');
    if (selectedTypes.hasError('required')) {
      return ERR_MSG_MIN_TYPE_REQUIRED;
    }
  }

  getSeveritiesErrorMessage(): string {
    const selectedSeverities: AbstractControl = this.filterForm.get('selectedSeverities');
    if (selectedSeverities.hasError('required')) {
      return ERR_MSG_MIN_SEVERITY_REQUIRED;
    }
  }

  getStatusesErrorMessage(): string {
    const selectedStatuses: AbstractControl = this.filterForm.get('selectedStatuses');
    if (selectedStatuses.hasError('required')) {
      return ERR_MSG_MIN_STATUS_REQUIRED;
    }
  }

  onTypesSelectionChange(types: MatSelectChange): void {
    this.withAllTypesSelected = types.value.length === this.types.length;
  }

  onAllTypesChanged(): void {
    this.withAllTypesSelected = !this.withAllTypesSelected;
    if (this.withAllTypesSelected) {
      this.filterForm.get('selectedTypes').setValue(this.types);
    } else {
      this.filterForm.get('selectedTypes').setValue([]);
    }
  }

  onSeveritiesSelectionChange(severities: MatSelectChange): void {
    this.withAllSeveritiesSelected = severities.value.length === this.severities.length;
  }

  onAllSeveritiesChanged(): void {
    this.withAllSeveritiesSelected = !this.withAllSeveritiesSelected;
    if (this.withAllSeveritiesSelected) {
      this.filterForm.get('selectedSeverities').setValue(this.severities);
    } else {
      this.filterForm.get('selectedSeverities').setValue([]);
    }
  }

  onStatusesSelectionChange(statuses: MatSelectChange): void {
    this.withAllStatusesSelected = statuses.value.length === this.statuses.length;
  }

  onAllStatusesChanged(): void {
    this.withAllStatusesSelected = !this.withAllStatusesSelected;
    if (this.withAllStatusesSelected) {
      this.filterForm.get('selectedStatuses').setValue(this.statuses);
    } else {
      this.filterForm.get('selectedStatuses').setValue([]);
    }
  }

}

class DateValidator {
  static validate(control: AbstractControl): ValidationErrors {
    const startDate: Date = control.get('startDate')?.value;
    const endDate: Date = control.get('endDate')?.value;

    if (!startDate) {
      control.get('startDate')?.setErrors({required: true});
      return ({required: true});
    }

    if (!endDate) {
      control.get('endDate')?.setErrors({required: true});
      return ({required: true});
    }

    if (startDate.getTime() > endDate.getTime()) {
      control.get('endDate')?.setErrors({after: true});
      return ({after: true});
    } else if (endDate.getFullYear() - startDate.getFullYear() > MAX_YEARS_INTERVAL) {
      control.get('endDate')?.setErrors({year_limit: true});
      return ({year_limit: true});
    }
  }
}
