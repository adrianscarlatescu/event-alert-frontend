import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {EventCommentService} from '../../../../service/event.comment.service';
import {ToastrService} from 'ngx-toastr';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventComment} from '../../../../model/event.comment';
import {SpinnerService} from '../../../../shared/spinner/spinner.service';
import {EventCommentRequest} from '../../../../model/request/event.comment.request';

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.css']
})
export class CommentDialogComponent implements OnInit {

  @ViewChild('commentTextarea') textElementRef: ElementRef;

  newEventComment: EventComment;

  constructor(private eventCommentService: EventCommentService,
              private toast: ToastrService,
              private spinnerService: SpinnerService,
              private dialogRef: MatDialogRef<CommentDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
  }

  ngOnInit(): void {
  }

  onValidateClicked(): void {
    const comment = this.textElementRef.nativeElement.value;
    if (comment.trim().length == 0) {
      this.toast.warning('The comment could not be empty');
      return;
    }

    if (comment.length > 1000) {
      this.toast.warning('Only 1000 characters allowed');
      return;
    }

    this.spinnerService.show();
    const commentRequest: EventCommentRequest = new EventCommentRequest();
    commentRequest.comment = comment;
    commentRequest.eventId = this.data.eventId;
    commentRequest.userId = this.data.userId;

    this.eventCommentService.postComment(commentRequest)
      .subscribe(eventComment => {
        this.spinnerService.close();
        this.toast.success('Comment posted');
        this.newEventComment = eventComment;
        this.dialogRef.close();
      }, () => this.spinnerService.close());
  }

}

export interface DialogData {
  eventId: number;
  userId: number;
}
