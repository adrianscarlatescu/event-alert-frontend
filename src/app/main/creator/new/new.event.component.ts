import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../../../service/session.service';
import {DomSanitizer} from '@angular/platform-browser';
import {EventTag} from '../../../model/event.tag';
import {EventSeverity} from '../../../model/event.severity';
import {ToastrService} from 'ngx-toastr';
import {FileService} from '../../../service/file.service';
import {EventService} from '../../../service/event.service';
import {FormControl, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {NewEventBody} from '../../../service/body/new.event.body';

@Component({
  selector: 'app-new-event',
  templateUrl: './new.event.component.html',
  styleUrls: ['./new.event.component.css']
})
export class NewEventComponent implements OnInit {

  @ViewChild('newEventDescriptionTextArea') description: ElementRef;

  latitude: number;
  longitude: number;

  file: File;
  eventImage;

  tags: EventTag[] = [];
  severities: EventSeverity[] = [];

  tagControl: FormControl;
  severityControl: FormControl;

  constructor(private fileService: FileService,
              private sessionService: SessionService,
              private eventService: EventService,
              private toast: ToastrService,
              private router: Router,
              private webLocation: Location,
              private domSanitizer: DomSanitizer) {

    const nav = this.router.getCurrentNavigation();
    if (!nav) {
      console.log('Wrong path to resource');
      this.webLocation.back();
      return;
    }

    this.latitude = nav.extras.state.latitude;
    this.longitude = nav.extras.state.longitude;

    if (!this.latitude || !this.longitude) {
      console.log('Location not provided');
      this.webLocation.back();
      return;
    }

    this.tags = sessionService.getTags().sort((a, b) => a.name.localeCompare(b.name));
    this.severities = sessionService.getSeverities();

    this.tagControl = new FormControl(undefined, Validators.required);
    this.severityControl = new FormControl(undefined, Validators.required);
  }

  ngOnInit(): void {

  }

  onImageChanged(event): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      const url = URL.createObjectURL(this.file);
      this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
    }
  }

  getImage(imagePath: string) {
    if (!imagePath) {
      return '../../../../assets/favicon.png';
    }
    const url: string = this.sessionService.getCacheImageByUrl(imagePath).toString();
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  onSaveClicked() {
    if (this.tagControl.invalid || this.severityControl.invalid) {
      this.toast.warning('Conditions not met');
      return;
    }
    if (!this.file) {
      this.toast.warning('Image not selected');
      return;
    }

    this.fileService.postImage(this.file, 'event_')
      .subscribe(imagePath => {
        const body = new NewEventBody();
        body.latitude = this.latitude;
        body.longitude = this.longitude;
        body.userId = this.sessionService.getUser().id;
        body.tagId = this.tagControl.value;
        body.severityId = this.severityControl.value;
        body.imagePath = imagePath.toString();
        body.description = this.description.nativeElement.value;

        this.eventService.postEvent(body)
          .subscribe(event => {
            if (event) {
              this.toast.success('Event successfully reported');
              this.router.navigate(['creator']);
            }
          });
      });

  }

  getTagErrorMessage() {
    if (this.tagControl.hasError('required')) {
      return 'The tag is required';
    }
  }

  getSeverityErrorMessage() {
    if (this.severityControl.hasError('required')) {
      return 'The severity is required';
    }
  }

}
