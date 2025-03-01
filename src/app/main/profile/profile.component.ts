import {Component, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {FileService} from '../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {SessionService} from '../../service/session.service';
import {UserDto} from '../../model/user.dto';
import {LENGTH_50, PHONE_NUMBER_PATTERN} from '../../defaults/constants';
import {
  ERR_MSG_FIRST_NAME_LENGTH,
  ERR_MSG_FIRST_NAME_REQUIRED,
  ERR_MSG_LAST_NAME_LENGTH,
  ERR_MSG_LAST_NAME_REQUIRED,
  ERR_MSG_PHONE_NUMBER_REQUIRED,
  ERR_MSG_PHONE_PATTERN
} from '../../defaults/field-validation-messages';
import {UserUpdateDto} from '../../model/user-update.dto';
import {GenderDto} from '../../model/gender.dto';
import {ImageType} from '../../enums/image-type';
import {SpinnerService} from '../../service/spinner.service';
import {GenderService} from '../../service/gender.service';
import {forkJoin, of} from 'rxjs';
import {concatMap, mergeMap, tap} from 'rxjs/operators';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isDataLoaded: boolean = false;

  connectedUser: UserDto;
  genders: GenderDto[];

  profileImage: SafeUrl;
  profileImageFile: File;

  profileForm: FormGroup;

  constructor(private userService: UserService,
              private genderService: GenderService,
              private fileService: FileService,
              private sessionService: SessionService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private formBuilder: FormBuilder,
              private domSanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.spinnerService.show();

    forkJoin([
      this.userService.getProfile(),
      this.genderService.getGenders()
    ])
      .pipe(concatMap(data => {
        this.connectedUser = data[0];
        this.genders = data[1];

        this.initForm();

        if (this.connectedUser.imagePath) {
          return this.fileService.getImage(this.connectedUser.imagePath)
            .pipe(tap(blob => this.setImage(blob)));
        }

        return of([]);
      }))
      .subscribe(() => {
        this.isDataLoaded = true;
        this.spinnerService.close()
      }, () => this.spinnerService.close());
  }

  initForm(): void {
    this.profileForm = this.formBuilder.group({
      firstName: [this.connectedUser.firstName, [Validators.required, Validators.maxLength(LENGTH_50)]],
      lastName: [this.connectedUser.lastName, [Validators.required, Validators.maxLength(LENGTH_50)]],
      gender: [this.connectedUser.gender.id],
      dateOfBirth: [this.connectedUser.dateOfBirth],
      phoneNumber: [this.connectedUser.phoneNumber, [Validators.required, Validators.pattern(PHONE_NUMBER_PATTERN)]]
    });
  }

  onImageChanged(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.profileImageFile = event.target.files[0];
      this.setImage(this.profileImageFile);
    }
  }

  onSaveClicked(): void {
    if (!this.profileForm.valid) {
      this.toast.error('Invalid form');
      this.profileForm.markAsTouched();
      return;
    }

    this.spinnerService.show();
    if (this.profileImageFile) {
      this.fileService.postImage(this.profileImageFile, ImageType.USER)
        .subscribe(imagePath => {
          this.connectedUser.imagePath = imagePath.toString();
          this.updateUser();
        }, () => this.spinnerService.close());
    } else {
      this.updateUser();
    }
  }

  private updateUser(): void {
    const userUpdate: UserUpdateDto = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      dateOfBirth: this.profileForm.value.dateOfBirth,
      phoneNumber: this.profileForm.value.phoneNumber,
      genderId: this.profileForm.value.gender,
      imagePath: this.connectedUser.imagePath,
      roleIds: this.connectedUser.roles.map(role => role.id)
    };

    this.userService.putProfile(userUpdate)
      .subscribe(() => {
        this.toast.success('Profile updated');
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  private setImage(blob: Blob): void {
    const url: string = URL.createObjectURL(blob);
    this.profileImage = this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  getRoles(): string {
    return this.connectedUser.roles.map(role => role.label).join(', ');
  }

  getFirstNameErrorMessage(): string {
    if (this.profileForm.get('firstName').hasError('required')) {
      return ERR_MSG_FIRST_NAME_REQUIRED;
    }
    if (this.profileForm.get('firstName').hasError('maxlength')) {
      return ERR_MSG_FIRST_NAME_LENGTH;
    }
  }

  getLastNameErrorMessage(): string {
    if (this.profileForm.get('lastName').hasError('required')) {
      return ERR_MSG_LAST_NAME_REQUIRED;
    }
    if (this.profileForm.get('lastName').hasError('maxlength')) {
      return ERR_MSG_LAST_NAME_LENGTH;
    }
  }

  getPhoneNumberErrorMessage(): string {
    if (this.profileForm.get('phoneNumber').hasError('required')) {
      return ERR_MSG_PHONE_NUMBER_REQUIRED;
    }
    if (this.profileForm.get('phoneNumber').hasError('pattern')) {
      return ERR_MSG_PHONE_PATTERN;
    }
  }

}
