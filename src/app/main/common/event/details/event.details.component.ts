import {Component, NgZone, OnInit} from '@angular/core';
import {Event} from '../../../../model/event';
import {ActivatedRoute, Router} from '@angular/router';
import {FileService} from '../../../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {EventComment} from '../../../../model/event.comment';
import {EventCommentService} from '../../../../service/event.comment.service';
import {EventService} from '../../../../service/event.service';
import {SessionService} from '../../../../service/session.service';
import {MapsAPILoader} from '@agm/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CommentDialogComponent} from '../comment/comment-dialog.component';
import {Location} from '@angular/common';
import {map, mergeMap} from 'rxjs/operators';
import {from} from 'rxjs';
import {MapViewDialogComponent} from './map/map-view-dialog.component';
import {SpinnerService} from '../../../../shared/spinner/spinner.service';

@Component({
  selector: 'app-event.details',
  templateUrl: './event.details.component.html',
  styleUrls: ['./event.details.component.css']
})
export class EventDetailsComponent implements OnInit {

  eventId: number;
  event: Event;
  eventImage: SafeUrl;
  eventUserImage: string;
  eventAddress: string;

  tagImage: string;
  severityColor: string;

  comments: EventComment[] = [];
  commentsUsersImages: CommentUserImage[] = [];

  constructor(private fileService: FileService,
              private eventService: EventService,
              private sessionService: SessionService,
              private eventCommentService: EventCommentService,
              private spinnerService: SpinnerService,
              private domSanitizer: DomSanitizer,
              private mapsApiLoader: MapsAPILoader,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private webLocation: Location,
              private ngZone: NgZone,
              private dialog: MatDialog) {

    const state = this.router.getCurrentNavigation().extras.state;
    if (!state) {
      webLocation.back();
    }
    this.eventId = state.id;

  }

  ngOnInit(): void {
    this.eventService.getEventById(this.eventId)
      .pipe(map(event => {
        this.event = event;
        this.tagImage = 'url(' + this.sessionService.getCacheImageByUrl(this.event.tag.imagePath) + ')';
        this.severityColor = '#' + this.event.severity.color.toString(16);

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
                console.log(status);
              }
            });
          });
        });
      }))
      .pipe(mergeMap(() => {
        return this.fileService.getImage(this.event.imagePath)
          .pipe(map(blob => {
            const url: string = URL.createObjectURL(blob);
            this.eventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
          }));
      }))
      .pipe(mergeMap(() => {
        return this.fileService.getImage(this.event.user.imagePath)
          .pipe(map(blob => {
            const reader: FileReader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              this.eventUserImage = 'url(' + reader.result + ')';
            };
          }));
      }))
      .pipe(mergeMap(() => {
        return this.eventCommentService.getCommentsByEventId(this.event.id)
          .pipe(mergeMap(comments => {
            this.comments = comments;

            return from(this.comments)
              .pipe(mergeMap(comment => {
                return this.fileService.getImage(comment.user.imagePath).pipe(map(blob => {
                  const url: string = URL.createObjectURL(blob);
                  const userImage: CommentUserImage = {
                    commentId: comment.id,
                    url: url
                  };
                  this.commentsUsersImages.push(userImage);
                }));
              }));

          }));
      }))
      .subscribe();
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
        userId: this.sessionService.getUser().id
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(() => {
        const newComment: EventComment = dialogRef.componentInstance.newEventComment;
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
    this.dialog.open(MapViewDialogComponent, {
      data: {
        latitude: this.event.latitude,
        longitude: this.event.longitude,
        tagImage: this.tagImage,
        severityColor: this.severityColor
      }
    });
  }

}

interface CommentUserImage {
  commentId: number,
  url: string
}
