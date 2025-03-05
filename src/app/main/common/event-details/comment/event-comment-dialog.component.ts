import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {LENGTH_1000} from '../../../../defaults/constants';
import {ERR_MSG_COMMENT_LENGTH, ERR_MSG_COMMENT_REQUIRED} from '../../../../defaults/field-validation-messages';

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './event-comment-dialog.component.html',
  styleUrls: ['./event-comment-dialog.component.css']
})
export class EventCommentDialogComponent implements OnInit {

  commentControl: FormControl;

  constructor(private toastrService: ToastrService,
              private dialogRef: MatDialogRef<EventCommentDialogComponent>) {
  }

  ngOnInit(): void {
    this.commentControl = new FormControl(undefined, [Validators.required, Validators.maxLength(LENGTH_1000)]);
  }

  onValidateClicked(): void {
    if (this.commentControl.invalid) {
      this.toastrService.error('Invalid form');
      this.commentControl.markAsTouched();
      return;
    }

    this.dialogRef.close(this.commentControl.value);
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
