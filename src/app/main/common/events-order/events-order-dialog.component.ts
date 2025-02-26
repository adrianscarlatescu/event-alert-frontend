import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {OrderCode} from '../../../enums/order-code';

@Component({
  selector: 'app-order.dialog',
  templateUrl: './events-order-dialog.component.html',
  styleUrls: ['./events-order-dialog.component.css']
})
export class EventsOrderDialogComponent implements OnInit {

  orderCode: OrderCode;

  constructor(private dialogRef: MatDialogRef<EventsOrderDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: OrderCode) {

    this.orderCode = data;

  }

  ngOnInit(): void {
  }

  onValidateClicked(): void {
    this.dialogRef.close(this.orderCode);
  }
}
