import {Component, Inject, OnInit} from '@angular/core';
import {CommentService} from '../../../../service/comment.service';
import {ToastrService} from 'ngx-toastr';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommentDto} from '../../../../model/comment.dto';
import {SpinnerService} from '../../../../shared/spinner/spinner.service';
import {LENGTH_1000} from '../../../../defaults/constants';
import {FormControl, Validators} from '@angular/forms';
import {ERR_MSG_COMMENT_LENGTH, ERR_MSG_COMMENT_REQUIRED} from '../../../../defaults/field-validation-messages';
import {CommentCreateDto} from '../../../../model/comment-create.dto';

@Component({
  selector: 'app-event-comment-dialog',
  templateUrl: './event-comment-dialog.component.html',
  styleUrls: ['./event-comment-dialog.component.css']
})
export class EventCommentDialogComponent implements OnInit {

  commentControl: FormControl;
  newEventComment: CommentDto;

  constructor(private eventCommentService: CommentService,
              private toast: ToastrService,
              private spinnerService: SpinnerService,
              private dialogRef: MatDialogRef<EventCommentDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
  }

  ngOnInit(): void {
    this.commentControl = new FormControl(undefined, [Validators.required, Validators.maxLength(LENGTH_1000)]);
  }

  onValidateClicked(): void {
    if (this.commentControl.invalid) {
      this.toast.error('Invalid form');
      this.commentControl.markAsTouched();
      return;
    }

    this.spinnerService.show();
    const commentCreate: CommentCreateDto = {
      comment: this.commentControl.value,
      eventId: this.data.eventId,
      userId: this.data.userId
    };

    this.eventCommentService.postComment(commentCreate)
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
