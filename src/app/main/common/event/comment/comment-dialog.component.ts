import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {EventCommentService} from '../../../../service/event.comment.service';
import {ToastrService} from 'ngx-toastr';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventCommentBody} from '../../../../service/body/event.comment.body';
import {EventComment} from '../../../../model/event.comment';
import {SpinnerService} from '../../../../shared/spinner/spinner.service';

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.css']
})
export class CommentDialogComponent implements OnInit {

  @ViewChild('commentTextarea') text: ElementRef;

  newEventComment: EventComment;

  constructor(private eventCommentService: EventCommentService,
              private toast: ToastrService,
              private spinnerService: SpinnerService,
              private dialogRef: MatDialogRef<CommentDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
  }

  ngOnInit(): void {
  }

  onValidateClicked() {
    const comment = this.text.nativeElement.value;
    if (comment.length == 0) {
      this.toast.warning('The comment could not be empty');
      return;
    }

    if (comment.length > 1000) {
      this.toast.warning('Only 1000 characters allowed');
      return;
    }

    this.spinnerService.show();
    const body = new EventCommentBody();
    body.comment = comment;
    body.eventId = this.data.eventId;
    body.userId = this.data.userId;
    this.eventCommentService.postComment(body)
      .subscribe(eventComment => {
        this.spinnerService.close();
        if (eventComment) {
          this.toast.success('Comment posted');
          this.newEventComment = eventComment;
          this.dialogRef.close();
        }
      });
  }

}

export interface DialogData {
  eventId: number;
  userId: number;
}
