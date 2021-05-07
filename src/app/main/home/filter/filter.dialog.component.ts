import {Component, Inject, OnInit} from '@angular/core';
import {FilterOptions} from './filter.options';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {SessionService} from '../../../service/session.service';
import {DomSanitizer} from '@angular/platform-browser';
import {EventTag} from '../../../model/event.tag';
import {EventSeverity} from '../../../model/event.severity';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'app-filter.dialog',
  templateUrl: './filter.dialog.component.html',
  styleUrls: ['./filter.dialog.component.css']
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
              private router: Router,
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
      radius: [this.filterOptions.radius, [Validators.required, Validators.min(1), Validators.max(10000)]],
      selectedTags: [this.tags
        .filter(tag =>
          this.filterOptions.tags
            .find(filterTag => filterTag.id === tag.id)), [Validators.required]],
      selectedSeverities: [this.severities
        .filter(severity =>
          this.filterOptions.severities
            .find(filterSeverity => filterSeverity.id === severity.id)), [Validators.required]],
      startDate: [this.filterOptions.startDate, [Validators.required]],
      endDate: [this.filterOptions.endDate, [Validators.required]],
    }, {
      validators: [DateValidator.validate]
    });
  }

  getImage(imagePath: string) {
    if (!imagePath) {
      return '../../../../assets/favicon.png';
    }
    const url: string = this.sessionService.getCacheImageByUrl(imagePath).toString();
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  onSaveClicked() {
    if (this.filterForm.invalid) {
      this.toast.warning('Conditions not met');
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
    const radius = this.filterForm.get('radius');
    if (radius.hasError('required')) {
      return 'The radius is required';
    }
    if (radius.hasError('min') || radius.hasError('max')) {
      return 'The radius must be between 1 and 10000';
    }
    return '';
  }

  getStartDateErrorMessage() {
    const startDate = this.filterForm.get('startDate');
    if (startDate.hasError('required')) {
      return 'The start date is required';
    }
    return '';
  }

  getEndDateErrorMessage() {
    const startDate = this.filterForm.get('startDate');
    if (startDate.hasError('required')) {
      return 'The end date is required';
    }

    const endDate = this.filterForm.get('endDate');
    if (endDate.hasError('required')) {
      return 'The end date must be after start date';
    }

    if (endDate.hasError('after')) {
      return 'Only one year difference allowed between start date and end date';
    }

    return '';
  }

  getTagsErrorMessage() {
    const selectedTags = this.filterForm.get('selectedTags');
    if (selectedTags.hasError('required')) {
      return 'At least one tag is required';
    }
    return '';
  }

  getSeveritiesErrorMessage() {
    const selectedSeverities = this.filterForm.get('selectedSeverities');
    if (selectedSeverities.hasError('required')) {
      return 'At least one severity is required';
    }
    return '';
  }

  onTagsSelectionChange(tags: MatSelectChange) {
    this.isAllTags = tags.value.length === this.tags.length;
  }

  onAllTagsChanged() {
    this.isAllTags = !this.isAllTags;
    if (this.isAllTags) {
      this.filterForm.get('selectedTags').setValue(this.tags);
    } else {
      this.filterForm.get('selectedTags').setValue([]);
    }
  }

  onSeveritiesSelectionChange(severities: MatSelectChange) {
    this.isAllSeverities = severities.value.length === this.severities.length;
  }

  onAllSeveritiesChanged() {
    this.isAllSeverities = !this.isAllSeverities;
    if (this.isAllSeverities) {
      this.filterForm.get('selectedSeverities').setValue(this.severities);
    } else {
      this.filterForm.get('selectedSeverities').setValue([]);
    }
  }

}

class DateValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const startDate: Date = control.get('startDate')?.value;
    const endDate: Date = control.get('endDate')?.value;
    if (startDate > endDate) {
      control.get('endDate')?.setErrors({after: true});
      return ({after: true});
    } else if (endDate.getFullYear() - startDate.getFullYear() > 1) {
      control.get('endDate')?.setErrors({year_limit: true});
      return ({year_limit: true});
    }
    return null;
  }
}
