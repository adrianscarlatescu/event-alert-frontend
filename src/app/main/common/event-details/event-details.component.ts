import {Component, NgZone, OnInit} from '@angular/core';
import {EventDto} from '../../../model/event.dto';
import {ActivatedRoute} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {CommentDto} from '../../../model/comment.dto';
import {CommentService} from '../../../service/comment.service';
import {EventService} from '../../../service/event.service';
import {SessionService} from '../../../service/session.service';
import {MapsAPILoader} from '@agm/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {concatMap, map, mergeMap, tap} from 'rxjs/operators';
import {forkJoin, from, of} from 'rxjs';
import {EventMapDialogComponent} from '../event-map/event-map-dialog.component';
import {CommentDialogComponent} from './comment/comment-dialog.component';
import {UserService} from '../../../service/user.service';
import {UserDto} from '../../../model/user.dto';
import {SpinnerService} from '../../../service/spinner.service';

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
  eventUserImage: string;
  eventAddress: string;

  typeImage: string;
  severityColor: string;

  comments: CommentDto[] = [];
  commentsUsersImages: CommentUserImage[] = [];

  connectedUser: UserDto;

  constructor(activatedRoute: ActivatedRoute,
              private sessionService: SessionService,
              private fileService: FileService,
              private userService: UserService,
              private spinnerService: SpinnerService,
              private eventService: EventService,
              private commentService: CommentService,
              private domSanitizer: DomSanitizer,
              private mapsApiLoader: MapsAPILoader,
              private ngZone: NgZone,
              private dialog: MatDialog) {

    this.eventId = Number(activatedRoute.snapshot.paramMap.get('id'));

  }

  ngOnInit(): void {
    this.spinnerService.show();

    forkJoin([
      this.userService.getProfile(),
      this.eventService.getEventById(this.eventId)
    ])
      .pipe(tap(data => {
        this.connectedUser = data[0];
        this.event = data[1];

        this.typeImage = 'url(' + this.sessionService.getCacheImageByUrl(this.event.type.imagePath) + ')';
        this.severityColor = this.event.severity.color;

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
      }))
      .pipe(concatMap(() => {
        const eventImageObservable = this.fileService.getImage(this.event.imagePath)
          .pipe(tap(blob => {
            const url: string = URL.createObjectURL(blob);
            this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
          }));

        const eventUserImageObservable = this.fileService.getImage(this.event.user.imagePath)
          .pipe(tap(blob => {
            const reader: FileReader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              this.eventUserImage = 'url(' + reader.result + ')';
            };
          }));

        const eventCommentsUsersImagesObservable = this.commentService.getCommentsByEventId(this.event.id)
          .pipe(concatMap(comments => {
            this.comments = comments;
            if (this.comments.length === 0) {
              return of([]);
            }

            return from(this.comments)
              .pipe(mergeMap(comment => {
                return this.fileService.getImage(comment.user.imagePath).pipe(tap(blob => {
                  const url: string = URL.createObjectURL(blob);
                  const userImage: CommentUserImage = {
                    commentId: comment.id,
                    url: url
                  };
                  this.commentsUsersImages.push(userImage);
                }));
              }));

          }));

        return forkJoin([eventImageObservable, eventUserImageObservable, eventCommentsUsersImagesObservable])
      }))
      .subscribe(data => {
        this.isDataLoaded = true;
        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  getEventCommentUserImage(commentId: number): SafeUrl {
    const eventCommentUserImage: CommentUserImage = this.commentsUsersImages.find(image => {
      return image.commentId === commentId;
    });
    if (eventCommentUserImage) {
      return this.domSanitizer.bypassSecurityTrustUrl(eventCommentUserImage.url);
    }
  }

  onNewCommentClicked(): void {
    const dialogRef: MatDialogRef<CommentDialogComponent> = this.dialog.open(CommentDialogComponent, {
      data: {
        eventId: this.event.id,
        userId: this.connectedUser.id
      }
    });

    dialogRef.afterClosed()
      .subscribe(() => {
        const newComment: CommentDto = dialogRef.componentInstance.newEventComment;
        if (!newComment) {
          return;
        }

        this.comments.unshift(newComment);
        this.fileService.getImage(newComment.user.imagePath)
          .subscribe(blob => {
            const url: string = URL.createObjectURL(blob);
            const userImage: CommentUserImage = {
              commentId: newComment.id,
              url: url
            };
            this.commentsUsersImages.unshift(userImage);
          });
      });
  }

  onMapViewClicked(): void {
    this.dialog.open(EventMapDialogComponent, {
      data: {
        latitude: this.event.latitude,
        longitude: this.event.longitude,
        typeImage: this.typeImage,
        severityColor: this.severityColor
      }
    });
  }

}

interface CommentUserImage {
  commentId: number,
  url: string
}
