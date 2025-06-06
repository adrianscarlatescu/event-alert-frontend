import {Component, NgZone, OnInit} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {ActivatedRoute} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {DomSanitizer, SafeStyle, SafeUrl} from '@angular/platform-browser';
import {CommentDto} from '../../../model/comment.dto';
import {CommentService} from '../../../service/comment.service';
import {EventService} from '../../../service/event.service';
import {SessionService} from '../../../service/session.service';
import {MapsAPILoader} from '@agm/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {concatMap, tap} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {EventMapDialogComponent} from './map/event-map-dialog.component';
import {EventCommentDialogComponent} from './comment/event-comment-dialog.component';
import {UserDto} from '../../../model/user.dto';
import {SpinnerService} from '../../../service/spinner.service';
import {CommentCreateDto} from '../../../model/comment-create.dto';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {

  isDataLoaded: boolean = false;

  eventId: number;
  event: EventDto;
  eventImage: SafeUrl;
  eventBackgroundImage: SafeStyle;
  eventAddress: string;
  eventUserImage: SafeUrl;

  comments: CommentDto[] = [];
  commentsUsersImages: Map<number, SafeUrl> = new Map<number, SafeUrl>();

  connectedUser: UserDto;

  constructor(activatedRoute: ActivatedRoute,
              private sessionService: SessionService,
              private fileService: FileService,
              private eventService: EventService,
              private commentService: CommentService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private domSanitizer: DomSanitizer,
              private mapsApiLoader: MapsAPILoader,
              private ngZone: NgZone,
              private dialog: MatDialog) {

    this.eventId = Number(activatedRoute.snapshot.paramMap.get('id'));

  }

  ngOnInit(): void {
    this.connectedUser = this.sessionService.getConnectedUser();

    this.spinnerService.show();
    this.eventService.getEventById(this.eventId)
      .pipe(concatMap(event => {
        this.event = event;

        this.mapsApiLoader.load().then(() => {
          const geo = new google.maps.Geocoder();
          const latLng = new google.maps.LatLng(this.event.latitude, this.event.longitude);
          const request = {
            location: latLng
          };

          geo.geocode(request, (results, status) => {
            this.ngZone.run(() => {
              if (status == google.maps.GeocoderStatus.OK) {
                this.eventAddress = results[0].formatted_address;
              } else {
                console.warn(status);
              }
            });
          });
        });

        const eventImageObservable = this.fileService.getImage(this.event.imagePath)
          .pipe(tap(blob => {
            const url: string = URL.createObjectURL(blob);

            this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);

            const reader: FileReader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => this.eventBackgroundImage = `url('${reader.result}')`;
          }));

        const eventUserImageObservable = this.fileService.getImage(this.event.user.imagePath)
          .pipe(tap(blob => {
            const url: string = URL.createObjectURL(blob);
            this.eventUserImage = this.domSanitizer.bypassSecurityTrustUrl(url);
          }));

        const eventCommentsUsersImagesObservable = this.commentService.getCommentsByEventId(this.event.id)
          .pipe(concatMap(comments => {
            this.comments = comments;
            if (this.comments.length === 0) {
              return of([]);
            }

            const imagesObservable = this.comments.map(comment => {
              return this.fileService.getImage(comment.user.imagePath)
                .pipe(tap(blob => {
                  const url: string = URL.createObjectURL(blob);
                  this.commentsUsersImages.set(comment.user.id, this.domSanitizer.bypassSecurityTrustUrl(url));
                }));
            });

            return forkJoin(imagesObservable);
          }));

        return forkJoin([eventImageObservable, eventUserImageObservable, eventCommentsUsersImagesObservable]);
      }))
      .subscribe(data => {
        this.isDataLoaded = true;
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
  }

  onNewCommentClicked(): void {
    const dialogRef: MatDialogRef<EventCommentDialogComponent> = this.dialog.open(EventCommentDialogComponent);

    dialogRef.componentInstance.onValidate.subscribe(newComment => {
      const commentCreate: CommentCreateDto = {
        comment: newComment,
        eventId: this.eventId,
        userId: this.connectedUser.id
      };

      this.spinnerService.show();
      this.commentService.postComment(commentCreate)
        .pipe(tap(newComment => {
          this.comments.unshift(newComment);
        }))
        .pipe(concatMap(newComment => {
          return this.fileService.getImage(newComment.user.imagePath)
            .pipe(tap(blob => {
              const url: string = URL.createObjectURL(blob);
              this.commentsUsersImages.set(newComment.user.id, this.domSanitizer.bypassSecurityTrustUrl(url));
            }));
        }))
        .subscribe(() => {
          dialogRef.componentInstance.close();

          this.spinnerService.close();
          this.toastrService.success('Comment posted');
        }, () => this.spinnerService.close());
    });
  }

  onMapViewClicked(): void {
    this.dialog.open(EventMapDialogComponent, {data: this.event, autoFocus: false});
  }

}
