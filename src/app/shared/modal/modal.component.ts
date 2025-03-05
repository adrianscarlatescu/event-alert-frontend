import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {

  @Input() showButtons: boolean = true;
  @Input() title: string;

  @Output() onValidate: EventEmitter<void> = new EventEmitter<void>();

  constructor(private dialogRef: MatDialogRef<ModalComponent>) {

  }

  onValidateClicked(): void {
    this.onValidate.next();
  }

  onCancelClicked(): void {
    this.dialogRef.close();
  }

}
