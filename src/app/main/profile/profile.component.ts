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
      firstName: [this.user.firstName, [Validators.required]],
      lastName: [this.user.lastName, [Validators.required]],
      gender: [this.user.gender],
      dateOfBirth: [this.user.dateOfBirth],
      phoneNumber: [this.user.phoneNumber]
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
      this.toast.warning('Invalid form');
      this.profileForm.markAsTouched();
      return;
    }

    this.spinnerService.show();
    if (this.file) {
      this.fileService.postImage(this.file, 'user_')
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
      return 'The first name is required';
    }
  }

  getLastNameErrorMessage(): string {
    if (this.profileForm.get('lastName').hasError('required')) {
      return 'The last name is required';
    }
  }

}
