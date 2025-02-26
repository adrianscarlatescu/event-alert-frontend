import {Component, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {FileService} from '../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {SessionService} from '../../service/session.service';
import {UserDto} from '../../model/user.dto';
import {SpinnerService} from '../../shared/spinner/spinner.service';
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


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: UserDto;
  genders: GenderDto[];
  profileImage: SafeUrl;
  profileForm: FormGroup;
  file: File;

  constructor(private userService: UserService,
              private fileService: FileService,
              private sessionService: SessionService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private formBuilder: FormBuilder,
              private domSanitizer: DomSanitizer) {

    this.user = this.sessionService.getUser();
    this.genders = this.sessionService.getGenders();

  }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      firstName: [this.user.firstName, [Validators.required, Validators.maxLength(LENGTH_50)]],
      lastName: [this.user.lastName, [Validators.required, Validators.maxLength(LENGTH_50)]],
      gender: [this.user.gender.id],
      dateOfBirth: [this.user.dateOfBirth],
      phoneNumber: [this.user.phoneNumber, [Validators.required, Validators.pattern(PHONE_NUMBER_PATTERN)]]
    });

    if (this.user.imagePath) {
      this.fileService.getImage(this.user.imagePath)
        .subscribe(image => {
          this.setImage(image);
        });
    }
  }

  onImageChanged(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      this.setImage(this.file);
    }
  }

  onSaveClicked(): void {
    if (!this.profileForm.valid) {
      this.toast.error('Invalid form');
      this.profileForm.markAsTouched();
      return;
    }

    this.spinnerService.show();
    if (this.file) {
      this.fileService.postImage(this.file, ImageType.USER)
        .subscribe(imagePath => {
          this.user.imagePath = imagePath.toString();
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
      imagePath: this.user.imagePath,
      roleIds: this.user.roles.map(role => role.id)
    };

    this.userService.putProfile(userUpdate)
      .subscribe(user => {
        this.toast.success('Profile updated');
        this.sessionService.setUser(user);
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  private setImage(file: any): void {
    const url: string = URL.createObjectURL(file);
    this.profileImage = this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  getRoles(): string {
    return this.user.roles.map(role => role.label).join(', ');
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
