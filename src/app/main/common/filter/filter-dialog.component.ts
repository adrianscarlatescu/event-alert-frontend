import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {SeverityDto} from '../../../model/severity.dto';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
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
import {SessionService} from '../../../service/session.service';
import {SafeUrl} from '@angular/platform-browser';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css']
})
export class FilterDialogComponent implements OnInit {

  @ViewChild(ModalComponent) modal: ModalComponent;

  onValidate: Subject<FilterOptions> = new Subject<FilterOptions>();

  filterForm: FormGroup;

  types: TypeDto[];
  withAllTypesSelected: boolean;

  severities: SeverityDto[];
  withAllSeveritiesSelected: boolean;

  statuses: StatusDto[];
  withAllStatusesSelected: boolean;

  constructor(private sessionService: SessionService,
              private toastrService: ToastrService,
              private formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA)
              private filterOptions: FilterOptions) {

  }

  ngOnInit(): void {
    this.types = this.sessionService.getTypes();
    this.withAllTypesSelected = this.filterOptions.typeIds.length === this.types.length;

    this.severities = this.sessionService.getSeverities();
    this.withAllSeveritiesSelected = this.filterOptions.severityIds.length === this.severities.length;

    this.statuses = this.sessionService.getStatuses();
    this.withAllStatusesSelected = this.filterOptions.statusIds.length === this.statuses.length;

    this.initForm();
  }

  initForm(): void {
    this.filterForm = this.formBuilder.group({
      radius: [this.filterOptions.radius, [Validators.required, Validators.min(MIN_RADIUS), Validators.max(MAX_RADIUS)]],
      typeIds: [this.filterOptions.typeIds, Validators.required],
      severityIds: [this.filterOptions.severityIds, Validators.required],
      statusIds: [this.filterOptions.statusIds, Validators.required],
      startDate: [this.filterOptions.startDate, Validators.required],
      endDate: [this.filterOptions.endDate, Validators.required],
    }, {
      validators: [DateValidator.validate]
    });
  }

  onValidateClicked(): void {
    if (this.filterForm.invalid) {
      this.toastrService.error('Invalid form');
      this.filterForm.markAllAsTouched();
      return;
    }

    const filterOptions: FilterOptions = {
      radius: this.filterForm.value.radius,
      startDate: this.filterForm.value.startDate,
      endDate: this.filterForm.value.endDate,
      typeIds: this.filterForm.value.typeIds,
      severityIds: this.filterForm.value.severityIds,
      statusIds: this.filterForm.value.statusIds
    }

    this.onValidate.next(filterOptions);
  }

  close(): void {
    this.modal.close();
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
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
    const selectedTypes: AbstractControl = this.filterForm.get('typeIds');
    if (selectedTypes.hasError('required')) {
      return ERR_MSG_MIN_TYPE_REQUIRED;
    }
  }

  getSeveritiesErrorMessage(): string {
    const selectedSeverities: AbstractControl = this.filterForm.get('severityIds');
    if (selectedSeverities.hasError('required')) {
      return ERR_MSG_MIN_SEVERITY_REQUIRED;
    }
  }

  getStatusesErrorMessage(): string {
    const selectedStatuses: AbstractControl = this.filterForm.get('statusIds');
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
      this.filterForm.get('typeIds').setValue(this.types.map(type => type.id));
    } else {
      this.filterForm.get('typeIds').setValue([]);
      this.filterForm.get('typeIds').markAsTouched({onlySelf: true});
    }
  }

  onSeveritiesSelectionChange(severities: MatSelectChange): void {
    this.withAllSeveritiesSelected = severities.value.length === this.severities.length;
  }

  onAllSeveritiesChanged(): void {
    this.withAllSeveritiesSelected = !this.withAllSeveritiesSelected;
    if (this.withAllSeveritiesSelected) {
      this.filterForm.get('severityIds').setValue(this.severities.map(severity => severity.id));
    } else {
      this.filterForm.get('severityIds').setValue([]);
      this.filterForm.get('severityIds').markAsTouched({onlySelf: true});
    }
  }

  onStatusesSelectionChange(statuses: MatSelectChange): void {
    this.withAllStatusesSelected = statuses.value.length === this.statuses.length;
  }

  onAllStatusesChanged(): void {
    this.withAllStatusesSelected = !this.withAllStatusesSelected;
    if (this.withAllStatusesSelected) {
      this.filterForm.get('statusIds').setValue(this.statuses.map(status => status.id));
    } else {
      this.filterForm.get('statusIds').setValue([]);
      this.filterForm.get('statusIds').markAsTouched({onlySelf: true});
    }
  }

  getTypesDropdownLabel(): string {
    const typeIds = this.filterForm.get('typeIds').value;
    return typeIds.length + ' types selected';
  }

  getSeveritiesDropdownLabel(): string {
    const severityIds = this.filterForm.get('severityIds').value;
    return severityIds.length + ' severities selected';
  }

  getStatusesDropdownLabel(): string {
    const statusIds = this.filterForm.get('statusIds').value;
    return statusIds.length + ' statuses selected';
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
