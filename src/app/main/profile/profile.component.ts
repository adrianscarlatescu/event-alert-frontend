import {Component, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {FileService} from '../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {SessionService} from '../../service/session.service';
import {UserRequest} from '../../model/request/user.request';
import {User} from '../../model/user';
import {SpinnerService} from '../../shared/spinner/spinner.service';
import {INVALID_FORM, MAX_USER_NAME_LENGTH, PHONE_NUMBER_REGEX, USER_IMAGE_FILE_PREFIX} from '../../defaults/constants';

const ERR_MSG_MANDATORY_FIRST_NAME: string = 'The first name is required';
const ERR_MSG_MANDATORY_LAST_NAME: string = 'The last name is required';
const ERR_MSG_FIRST_NAME_LENGTH: string = 'The first name must have at most ' + MAX_USER_NAME_LENGTH + ' characters';
const ERR_MSG_LAST_NAME_LENGTH: string = 'The last name must have at most ' + MAX_USER_NAME_LENGTH + ' characters';
const ERR_MSG_PHONE_PATTERN: string = 'The phone number does not match the expected format';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User;
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

  }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      firstName: [this.user.firstName, [Validators.required, Validators.maxLength(MAX_USER_NAME_LENGTH)]],
      lastName: [this.user.lastName, [Validators.required, Validators.maxLength(MAX_USER_NAME_LENGTH)]],
      gender: [this.user.gender],
      dateOfBirth: [this.user.dateOfBirth],
      phoneNumber: [this.user.phoneNumber, Validators.pattern(PHONE_NUMBER_REGEX)]
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
      this.toast.warning(INVALID_FORM);
      this.profileForm.markAsTouched();
      return;
    }

    this.spinnerService.show();
    if (this.file) {
      this.fileService.postImage(this.file, USER_IMAGE_FILE_PREFIX)
        .subscribe(imagePath => {
          this.user.imagePath = imagePath.toString();
          this.updateUser();
        }, () => this.spinnerService.close());
    } else {
      this.updateUser();
    }
  }

  private updateUser(): void {
    const userRequest: UserRequest = new UserRequest();
    userRequest.firstName = this.profileForm.value.firstName;
    userRequest.lastName = this.profileForm.value.lastName;
    userRequest.dateOfBirth = this.profileForm.value.dateOfBirth;
    userRequest.phoneNumber = this.profileForm.value.phoneNumber;
    userRequest.gender = this.profileForm.value.gender;
    userRequest.imagePath = this.user.imagePath;
    userRequest.roles = this.user.userRoles.map(userRole => userRole.name);

    this.userService.putProfile(userRequest)
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

  getFirstNameErrorMessage(): string {
    if (this.profileForm.get('firstName').hasError('required')) {
      return ERR_MSG_MANDATORY_FIRST_NAME;
    }
    if (this.profileForm.get('firstName').hasError('maxlength')) {
      return ERR_MSG_FIRST_NAME_LENGTH;
    }
  }

  getLastNameErrorMessage(): string {
    if (this.profileForm.get('lastName').hasError('required')) {
      return ERR_MSG_MANDATORY_LAST_NAME;
    }
    if (this.profileForm.get('lastName').hasError('maxlength')) {
      return ERR_MSG_LAST_NAME_LENGTH;
    }
  }

  getPhoneNumberErrorMessage(): string {
    if (this.profileForm.get('phoneNumber').hasError('pattern')) {
      return ERR_MSG_PHONE_PATTERN;
    }
  }

}
