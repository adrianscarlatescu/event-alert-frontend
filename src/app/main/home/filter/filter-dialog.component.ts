import {Component, Inject, OnInit} from '@angular/core';
import {FilterOptions} from './filter.options';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {SessionService} from '../../../service/session.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {EventTag} from '../../../model/event.tag';
import {EventSeverity} from '../../../model/event.severity';
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
  ERR_MSG_MIN_TAG_REQUIRED,
  ERR_MSG_RADIUS_REQUIRED,
  ERR_MSG_START_DATE_REQUIRED
} from '../../../defaults/field-validation-messages';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css']
})
export class FilterDialogComponent implements OnInit {

  filterOptions: FilterOptions;
  filterForm: FormGroup;

  tags: EventTag[];
  isAllTags: boolean;

  severities: EventSeverity[];
  isAllSeverities: boolean;

  isNewSearch: boolean;

  constructor(private sessionService: SessionService,
              private toast: ToastrService,
              private formBuilder: FormBuilder,
              private domSanitizer: DomSanitizer,
              private dialogRef: MatDialogRef<FilterDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: FilterOptions) {

    this.filterOptions = data;
    this.isNewSearch = false;

    this.tags = sessionService.getTags().sort((a, b) => a.name.localeCompare(b.name));
    this.isAllTags = this.filterOptions.tags.length === this.tags.length;

    this.severities = sessionService.getSeverities();
    this.isAllSeverities = this.filterOptions.severities.length === this.severities.length;

  }

  ngOnInit(): void {
    this.filterForm = this.formBuilder.group({
      radius: [this.filterOptions.radius, [Validators.required, Validators.min(MIN_RADIUS), Validators.max(MAX_RADIUS)]],
      selectedTags: [this.tags.filter(tag =>
        this.filterOptions.tags.find(filterTag => filterTag.id === tag.id)), [Validators.required]],
      selectedSeverities: [this.severities.filter(severity =>
        this.filterOptions.severities.find(filterSeverity => filterSeverity.id === severity.id)), [Validators.required]],
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

    this.filterOptions.radius = this.filterForm.value.radius;
    this.filterOptions.startDate = this.filterForm.value.startDate;
    this.filterOptions.endDate = this.filterForm.value.endDate;
    this.filterOptions.tags = this.filterForm.value.selectedTags;
    this.filterOptions.severities = this.filterForm.value.selectedSeverities;

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

  getTagsErrorMessage(): string {
    const selectedTags: AbstractControl = this.filterForm.get('selectedTags');
    if (selectedTags.hasError('required')) {
      return ERR_MSG_MIN_TAG_REQUIRED;
    }
  }

  getSeveritiesErrorMessage(): string {
    const selectedSeverities: AbstractControl = this.filterForm.get('selectedSeverities');
    if (selectedSeverities.hasError('required')) {
      return ERR_MSG_MIN_SEVERITY_REQUIRED;
    }
  }

  onTagsSelectionChange(tags: MatSelectChange): void {
    this.isAllTags = tags.value.length === this.tags.length;
  }

  onAllTagsChanged(): void {
    this.isAllTags = !this.isAllTags;
    if (this.isAllTags) {
      this.filterForm.get('selectedTags').setValue(this.tags);
    } else {
      this.filterForm.get('selectedTags').setValue([]);
    }
  }

  onSeveritiesSelectionChange(severities: MatSelectChange): void {
    this.isAllSeverities = severities.value.length === this.severities.length;
  }

  onAllSeveritiesChanged(): void {
    this.isAllSeverities = !this.isAllSeverities;
    if (this.isAllSeverities) {
      this.filterForm.get('selectedSeverities').setValue(this.severities);
    } else {
      this.filterForm.get('selectedSeverities').setValue([]);
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
