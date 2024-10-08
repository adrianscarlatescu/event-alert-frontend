import {Component, Inject, OnInit} from '@angular/core';
import {EventCommentService} from '../../../../service/event.comment.service';
import {ToastrService} from 'ngx-toastr';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventComment} from '../../../../model/event.comment';
import {SpinnerService} from '../../../../shared/spinner/spinner.service';
import {EventCommentRequest} from '../../../../model/request/event.comment.request';
import {MAX_COMMENT_LENGTH} from '../../../../defaults/constants';
import {FormControl, Validators} from '@angular/forms';
import {ERR_MSG_COMMENT_LENGTH, ERR_MSG_COMMENT_REQUIRED} from '../../../../defaults/field-validation-messages';


@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.css']
})
export class CommentDialogComponent implements OnInit {

  commentControl: FormControl;
  newEventComment: EventComment;

  constructor(private eventCommentService: EventCommentService,
              private toast: ToastrService,
              private spinnerService: SpinnerService,
              private dialogRef: MatDialogRef<CommentDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
  }

  ngOnInit(): void {
    this.commentControl = new FormControl(undefined, [Validators.required, Validators.maxLength(MAX_COMMENT_LENGTH)]);
  }

  onValidateClicked(): void {
    if (this.commentControl.invalid) {
      this.toast.error('Invalid form');
      this.commentControl.markAsTouched();
      return;
    }

    this.spinnerService.show();
    const commentRequest: EventCommentRequest = new EventCommentRequest();
    commentRequest.comment = this.commentControl.value;
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

  getCommentErrorMessage(): string {
    if (this.commentControl.hasError('required')) {
      return ERR_MSG_COMMENT_REQUIRED;
    }
    if (this.commentControl.hasError('maxlength')) {
      return ERR_MSG_COMMENT_LENGTH;
    }
  }

}

export interface DialogData {
  eventId: number;
  userId: number;
}
