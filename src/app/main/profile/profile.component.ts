import {Component, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {FileService} from '../../service/file.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {SessionService} from '../../service/session.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user;
  profileImage;
  profileForm: FormGroup;
  file: File;

  constructor(private userService: UserService,
              private fileService: FileService,
              private sessionService: SessionService,
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

  onImageChanged(event): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      this.setImage(this.file);
    }
  }

  onSaveClicked(): void {
    if (!this.profileForm.valid) {
      console.log('Invalid form');
      return;
    }
    if (this.file) {
      this.fileService.postImage(this.file, 'user_')
        .subscribe(imagePath => {
          this.user.imagePath = imagePath.toString();
          this.updateUser();
        });
    } else {
      this.updateUser();
    }
  }

  private updateUser(): void {
    this.userService.putProfile(this.user)
      .subscribe(user => {
        if (user) {
          this.toast.success('Profile updated');
          this.sessionService.setUser(user);
        }
      });
  }

  private setImage(file: any): void {
    const url = URL.createObjectURL(file);
    this.profileImage = this.domSanitizer.bypassSecurityTrustUrl(url);
  }

}
